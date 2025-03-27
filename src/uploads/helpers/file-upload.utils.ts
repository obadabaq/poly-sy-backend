export const editFileName = (req, file, callback) => {
    const name = req.params.id;
    const fileExtName = file.originalname.split('.').pop();
    const randomName = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    callback(null, `${name ?? ""}${name ? "-" : ""}${randomName}.${fileExtName}`);
  };
  