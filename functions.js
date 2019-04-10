const generateRandomString = () => {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const emailCheck = (object, str) => {
  console.log(object);
  for(let key in object) {
    console.log(object[key].email);
    if(object[key].email === str) {
      return true;
    }
  }
  return false;
}

module.exports = {
  generateStr : generateRandomString,
  emailCheck : emailCheck
}
