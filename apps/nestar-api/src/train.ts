// TASK-ZM

function reverseNumbers(number: number) {
    const str = number.toString();
    const list  = str.split('').reverse();
    return list.reduce((total, value) => {
        return total + value;
    })
}

const result = reverseNumbers(12345);
console.log("result: ", result);