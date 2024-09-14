// const status = callback => {
//   fetch('http://127.0.0.1:10103/v2/status', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//   })
//     .then(res => {
//       console.log(1, res);
//       res.json()
//     })
//     .then(res => {
//       console.log(2, res);
//       return callback(null, res);
//     })
//     .catch(err => {
//       console.log(err);
//       return callback('fetch_error');
//     });
// };

// status((err, res) => {
//   if (err)
//     console.error(err);
//   else
//     console.log(res);
// });

const status = callback => {
  fetch('http://127.0.0.1:10103/v2/blocks/727577/data?fields=data,extrinsic', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(res => res.json())
    .then(res => {
      return callback(null, res);
    })
    .catch(err => {
      console.log(err);
      return callback('fetch_error');
    });
};

status((err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log(res);
  }
});
