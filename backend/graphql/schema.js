const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type TestData{
    text: String!
    views: Int!
    }
    
    type RootQuery {
    hello: TestData! 
    }

    schema {
    query: RootQuery
    }
    `);

// ! => means this field is required
