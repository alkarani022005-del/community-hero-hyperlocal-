const router = require('express').Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { analyzeIssue } = require('../utils/gemini');

router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status)   filter.status = status;
    const issues = await Issue.find(filter)
      .populate('reporter', 'name points')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/ai/weekly-digest', async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const issues = await Issue.find({ createdAt: { $gte: weekAgo } });
    const allIssues = await Issue.find({ status: { $ne: 'Resolved' } });
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const summary = issues.map(i =>
      `- ${i.title} (${i.category}, ${i.severity}, ${i.status}) at ${i.location?.address}`
    ).join('\n');
    const unresolved = allIssues.map(i =>
      `- ${i.title} (${i.category}) - ${i.upvotes?.length || 0} upvotes`
    ).join('\n');
    const prompt = `You are a civic AI assistant for Hazaribagh, Jharkhand. Generate a weekly digest report.

NEW ISSUES THIS WEEK (${issues.length} total):
${summary || 'No new issues this week'}

ALL UNRESOLVED ISSUES (${allIssues.length} total):
${unresolved || 'No unresolved issues'}

Generate a professional weekly digest with:
1. Executive Summary (2-3 sentences)
2. Key highlights this week
3. Most critical unresolved issues (top 3)
4. Category breakdown insights
5. Recommended priority actions for the municipality
6. Motivational closing for community members

Keep it concise, data-driven, and actionable.`;
    const result = await model.generateContent(prompt);
    const digest = result.response.text();
    res.json({
      digest,
      stats: {
        newThisWeek: issues.length,
        totalUnresolved: allIssues.length,
        resolved: await Issue.countDocuments({ status: 'Resolved' }),
        critical: await Issue.countDocuments({ severity: 'Critical', status: { $ne: 'Resolved' } }),
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/check-duplicate', protect, async (req, res) => {
  try {
    const { title, description, address } = req.body;
    const recentIssues = await Issue.find({
      'location.city': 'Hazaribagh',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).limit(20);
    if (recentIssues.length === 0) return res.json({ isDuplicate: false });
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const issuesList = recentIssues.map((i, idx) =>
      `${idx + 1}. Title: "${i.title}" | Location: "${i.location?.address}" | Category: ${i.category}`
    ).join('\n');
    const prompt = `You are checking if a new civic issue report is a duplicate of existing ones.

NEW REPORT:
Title: "${title}"
Description: "${description}"
Address: "${address}"

EXISTING ISSUES (last 30 days):
${issuesList}

Respond ONLY in valid JSON with no extra text:
{
  "isDuplicate": true or false,
  "confidence": "High" or "Medium" or "Low",
  "matchedIssueIndex": null or the number of the matching issue (1-based),
  "reason": "one sentence explanation"
}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(text);
    let matchedIssue = null;
    if (data.isDuplicate && data.matchedIssueIndex) {
      matchedIssue = recentIssues[data.matchedIssueIndex - 1];
    }
    res.json({ ...data, matchedIssue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name')
      .populate('verifiedBy', 'name');
    if (!issue) return res.status(404).json({ message: 'Not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, address, lat, lng, images } = req.body;
    const aiData = await analyzeIssue(title, description);
    const issue = await Issue.create({
      title, description,
      category:   aiData.category,
      severity:   aiData.severity,
      department: aiData.department,
      aiSummary:  aiData.aiSummary,
      location:   { address, lat, lng, city: 'Hazaribagh' },
      images:     images || [],
      reporter:   req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    const alreadyUpvoted = issue.upvotes.includes(req.user._id);
    if (alreadyUpvoted) {
      issue.upvotes.pull(req.user._id);
    } else {
      issue.upvotes.push(req.user._id);
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: 2 } });
    }
    await issue.save();
    res.json({ upvotes: issue.upvotes.length, upvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/verify', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue.verifiedBy.includes(req.user._id)) {
      issue.verifiedBy.push(req.user._id);
      if (issue.verifiedBy.length >= 3) issue.status = 'Verified';
      await issue.save();
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });
    }
    res.json({ verifiedBy: issue.verifiedBy.length, status: issue.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', protect, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/generate-letter', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('reporter', 'name');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Write a formal complaint letter to the ${issue.department || 'Municipal Corporation'} about this civic issue in Hazaribagh, Jharkhand, India.

Issue: ${issue.title}
Description: ${issue.description}
Location: ${issue.location?.address}
Category: ${issue.category}
Severity: ${issue.severity}
Reported by: ${issue.reporter?.name}
Date: ${new Date(issue.createdAt).toLocaleDateString('en-IN')}
Community upvotes: ${issue.upvotes?.length || 0}
Community verifications: ${issue.verifiedBy?.length || 0}

Write a professional complaint letter with:
- Proper salutation to the department head
- Clear description of the problem and community impact
- Request for immediate action with timeline
- Mention ${issue.upvotes?.length || 0} citizens have upvoted this
- Professional closing

Return only the letter text, no extra explanation.`;
    const result = await model.generateContent(prompt);
    const letter = result.response.text();
    res.json({ letter });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;