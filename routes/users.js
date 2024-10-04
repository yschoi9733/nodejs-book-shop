const express = require('express');
const router = express.Router();
router.use(express.json());

router.post('/join', (req, res) => {
  res.json('회원가입');
})

router.post('/login', (req, res) => {
  res.json('로그인');
})

router.post('/reset', (req, res) => {
  let {email} = req.body;
  
})

router.put('/reset', (req, res) => {
  res.json('비밀번호 초기화');
})

module.exports = router;