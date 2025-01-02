import fs from 'fs/promises';

const voteProofs = await fs.readFile('voteProofs.json').then((data) => JSON.parse(data.toString()));

let count = 0;

console.time('All votes verified');

// linear verification
function sendVerifyRequest(i: number, callback: any) {
  if (i >= 100) {
    callback();
    return;
  };

  fetch('http://localhost:3000/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(voteProofs[i]),
  })
    .then((res) => res.json())
    .then((data) => {
      count++;
      console.log(`Vote ${i + 1} verified in ${data.timeTaken}ms`);
      sendVerifyRequest(i + 1, callback);
    });
};
sendVerifyRequest(0, () => {});

// parallel verification
// for (let i = 0; i < 100; i++) {
//   fetch('http://localhost:3000/verify', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(voteProofs[i]),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       count++;
//       console.log(`Vote ${i + 1} verified in ${data.timeTaken}ms`);
//     });
// };

while (count < 100) {
  await new Promise((resolve) => setTimeout(resolve, 100));
};

console.timeEnd('All votes verified');
