Here’s the resolved version that keeps the updated `auth` export style (so it still works with the new `isPolice`/`requireRole` features):

```js
const express = require('express');
const router  = express.Router();
const { getComments, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:reportId',  protect, getComments);
router.post('/:reportId', protect, addComment);

module.exports = router;
```
