// TASK-ZM

// function reverseNumbers(number: number) {
//     const str = number.toString();
//     const list  = str.split('').reverse();
//     return list.reduce((total, value) => {
//         return total + value;
//     })
// }

// const result = reverseNumbers(12345);
// console.log("result: ", result);

// TASK-ZN

// function rotateArray(array: number[], index: number) {
//     return array.slice(index).concat(array.slice(0, index));
// }

// const result = rotateArray([1,2,3,4,5,6], 4);
// console.log("result: ", result);

// TASK-ZO

// function areParentheseBalanced(string: string) {
//     const list = string.split('');
//     if(list.indexOf('(') > list.indexOf(')')){
//         return false;
//     } else if(list.map((value) => {return value === '('}).length != list.map((value) => {return value === ')'}).length) {
//         return false
//     } else {
//         return true
//     }
// }
// const result = areParentheseBalanced("string()ichida(qavslar)soni()balansda");
// console.log("result: ", result);

// TASK-ZP

function countNumbersAndLetters(string: string) {
    let numbers = [];
    let letters = [];
    const regexLiteral = /[A-z]/;
    const list = string.split('');
    list.forEach((value) => {
        if(value.match(regexLiteral)){
            letters.push(value);
        } else if(!isNaN(Number.parseInt(value))){
            numbers.push(value);
        }
    })
    const result = {
        numbers: numbers.length,
        letters: letters.length,
    }
    return result;
}

const result = countNumbersAndLetters('strings@152%');
console.log(`letter: ${result.letters}, numbers: ${result.numbers}`);