new Vue({
  el: '#app',
  data: function() {
    return {
      config: {
        minLength: 6,
        minNumbers: 0,
        minSymbols: 0,
        maxLength: 24,
        maxNumbers: 12,
        maxSymbols: 12
      },
      password: '',
      isCopied: false,
      userIP: ''
    }
  },
  computed: {
    // TODO
    pwdStrength () {
      let pwdStrength = {
        text: '',
        score: 0
      };
      
      let counter = {
        excess: 0,
        upperCase: 0,
        numbers: 0,
        symbols: 0
      };

      let weight = {
        excess: 3,
        upperCase: 4,
        numbers: 5,
        symbols: 5,
        combo: 0,
        flatLower: 0,
        flatNumber: 0
      };
      
      let baseScore = 30;

      for (let i = 0; i < this.password.length; i++){
        if (this.password.charAt(i).match(/[A-Z]/g)) {
          counter.upperCase++;
        }
        if (this.password.charAt(i).match(/[0-9]/g)) {
          counter.numbers++;
        }
        if (this.password.charAt(i).match(/(.*[-,#,^,+,@,^,%,|,*,?,!,$,=])/)) {
          counter.symbols++;
        } 
      }
      
      counter.excess = this.password.length - 6;
      
      if (counter.upperCase && counter.numbers && counter.symbols){
        weight.combo = 25; 
      } else if ((counter.upperCase && counter.numbers) || (counter.upperCase && counter.symbols) || (counter.numbers && counter.symbols)){
        weight.combo = 15; 
      }
      
      if (this.password.match(/^[\sa-z]+$/)) { 
        weight.flatLower = -30;
      }
      
      if (this.password.match(/^[\s0-9]+$/)) { 
        weight.flatNumber = -50;
      }
      let score = 
        baseScore + 
        (counter.excess * weight.excess) + 
        (counter.upperCase * weight.upperCase) + 
        (counter.numbers * weight.numbers) + 
        (counter.symbols * weight.symbols) + 
        weight.combo + weight.flatLower + 
        weight.flatNumber;
      
      switch (true) {
        case score < 30:
          pwdStrength.text = "weak";
          pwdStrength.score = 10;
          return pwdStrength;
        case score >= 30 && score < 75:
          pwdStrength.text = "better";
          pwdStrength.score = 40;
          return pwdStrength;
        case score >= 75 && score < 150:
          pwdStrength.text = "strong";
          pwdStrength.score = 75;
          return pwdStrength;
        default:
          pwdStrength.text = "strongest";
          pwdStrength.score = 100;
          return pwdStrength;
      }
    },
    // TODO
    lengthThumbPosition () {
      return (( (this.config.minLength - 6) / (this.config.maxLength - 6)) * 100);
    },
    numbersProgress () {
      return (( (this.config.minNumbers) / (this.config.maxNumbers)) * 100);
    },
    symbolsProgress () {
      return (( (this.config.minSymbols) / (this.config.maxSymbols)) * 100);
    }
  },
  methods: {
    // 一般來說都是開個 input 或是 textarea，
    // 這邊會使用 createRange() 這個 API，實作複製到剪貼板這個功能
    clipboardCopied () {
      let text = document.getElementById("pwd-input");
      let range = document.createRange();

      window.getSelection().removeAllRanges();
      range.selectNode(text);
      window.getSelection().addRange(range);
      document.execCommand("copy");
      window.getSelection().removeAllRanges();

      this.isCopied = true;
      // setTimeout 用途提一下
      setTimeout(() => {
        this.isCopied = false;
      }, 850);
    },
    // TODO
    generatePwd () {
      let tempPasswordArray  = [];
      let tempNumbersArray  = [];

      const LETTERS_ARRAY = this.generateLettersArray("a", "z")
      const SYMBOLS_ARRAY = [ "-","#","^","+","@","^","%","|","*","?","!","$","="]

      // first, fill the password array with letters, uppercase and lowecase
      for (let i = 0; i < this.config.minLength; i++) {
        // get an array for all indexes of the password array
        tempNumbersArray .push(i);
        let upperCase = Math.round(Math.random() * 1);
        if (upperCase === 0) {
          tempPasswordArray [i] = LETTERS_ARRAY[Math.floor(Math.random()*LETTERS_ARRAY.length)].toUpperCase();
        } else {
          tempPasswordArray [i] = LETTERS_ARRAY[Math.floor(Math.random()*LETTERS_ARRAY.length)];
        }
      }
      // Add digits to password
      for (let i = 0; i < this.config.minNumbers; i++) {
        let digit = Math.round(Math.random() * 9);
        let numberIndex = tempNumbersArray [Math.floor(Math.random()*tempNumbersArray.length)];
        tempPasswordArray [numberIndex] =  digit;
        /* remove position from tempNumbersArray  so we make sure to the have the exact number of digits in our password
        since without this step, numbers may override other numbers */
        let j = tempNumbersArray.indexOf(numberIndex);
        if (i !== -1) {
          tempNumbersArray.splice(j, 1);
        }
      }
      // add symbols
      for (let i = 0; i < this.config.minSymbols; i++) {
        let symbol = SYMBOLS_ARRAY[Math.floor(Math.random()*SYMBOLS_ARRAY.length)];
        let symbolIndex = tempNumbersArray [Math.floor(Math.random()*tempNumbersArray.length)];
        tempPasswordArray [symbolIndex] =  symbol;
        /* remove position from tempNumbersArray  so we make sure to the have the exact number of digits in our password
        since without this step, numbers may override other numbers */
        let j = tempNumbersArray.indexOf(symbolIndex);
        if (i !== -1) {
          tempNumbersArray.splice(j, 1);
        }
      }
      this.password = tempPasswordArray .join("");
    },
    // 把餵進來的密碼強度 wording 轉成首字大寫，並加上驚嘆號回傳
    formatter (s) {
      if (typeof s !== 'string') {
        return ''
      }
      // 不知道 slice 用法的也可以直接在 Chrome DevTools 打開起來玩玩看
      // 一邊複習前面章節提到的工具使用小技巧
      return s.charAt(0).toUpperCase() + s.slice(1) + '!'
    },
    // 讓 charCodeAt 去生出一個 a 到 z 的 Array
    generateLettersArray (a, z) {
      let temp = [],
          i = a.charCodeAt(0),
          j = z.charCodeAt(0);

      for (; i <= j; i++) {
        temp.push(String.fromCharCode(i));
      }
      return temp;
    },
    getUserIP() {
      fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
          this.userIP = data.ip;
        })
        .catch(error => {
          console.error('Error fetching IP address:', error);
        });
    }
  },
  // TODO
  watch: {
    config: {
      handler: function() {
        this.generatePwd();
      },
      deep: true
    }
  },
  // 在 mounted 這個生命週期的狀態就去呼叫 generatePwd 這支函式
  mounted() {
    this.generatePwd();
    this.getUserIP();
  }
})