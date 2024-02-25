export const input = {
  // PutItemInput
  TableName: process.env.DB, // required

  Item: {
    // Item to be written
    pk: { S: "wesley" },
    // Example ISBN

    // Example author
    // Add other attributes as needed
  },
};
