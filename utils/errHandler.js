process.on('error', function (err) {
    console.error(err);
});
process.on('uncaughtException', function (err) {
    console.error(err);
});
