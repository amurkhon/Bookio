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

function rotateArray(array: number[], index: number) {
    return array.slice(index).concat(array.slice(0, index));
}

const result = rotateArray([1,2,3,4,5,6], 4);
console.log("result: ", result);