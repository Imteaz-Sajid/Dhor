Here’s the resolved version keeping the updated `auth` export style so everything still works with the role middleware:

```js
const express = require('express');
const router  = express.Router();
const { createMissing, getMissing, updateStatus } = require('../controllers/missingController');
const { protect } = require('../middleware/auth');

router.get('/',              protect, getMissing);
router.post('/',             protect, createMissing);
router.put('/:id/status',    protect, updateStatus);

module.exports = router;
```
