const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const validUrl = require('valid-url');
const PORT = 4000;

// const urlExists = import('url-exists-nodejs');

const { Database } = require('fakebase');
const db = new Database('./data');
const Url = db.table('urls')

const app = express();

const schema = buildSchema(`
    type Url {
        name: String!
        originalUrl: String!,
        shortenedUrl: String
    }

    type Query {
        getUrls: [Url!],
    }

    type Mutation {
        shortenUrl(url: String!): String,
        originalUrl(id: String!): String
    }
    
`);


// type ShortUrl {
//     shortenUrl: String
// }

// type Mutation {
//     shortenedUrl(input: shortenedUrlInput!): Url
// }

// input shortenedUrlInput {
//     name: String!
//     originalUrl: String!,
//     shortenUrl: String
// }

const urlMap = {};

const rootValue = {
    shortenUrl: ({ url }) => {

        if (!validUrl.isUri(url)) {
            throw new Error("This URL is Invalid.");
        }

        const id = (Math.random() + 1).toString(36).substring(6);
        urlMap[id] = url;

        return `http://localhost:4000/graphql/${id}`;
    },

    // this takes the id as an argument and returns the original Url associated with it, if it exists.
    originalUrl: ({ id }) => {
        const url = urlMap[id];

        // check if it exists
        if (!url) {
            throw new Error("This URL is Invalid.");
        }

        // returns the original Url
        return url;
    },

    getUrls: () => Url.findAll(),

    // shortenedUrl: (_root, { input }) => Url.update(input)
};

app.use("/graphql", graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
}));


app.get("/:shortUrl", (req, res) => {
    const { id } = req.params;
    const url = urlMap[id];

    // check if url to be shortened is valid
    // if (urlExists) {
    //     res.redirect(url);
    // } else {
    //     res.send("This URL is Invalid.");
    // }
    if (url) {
        res.redirect(url);
    } else {
        res.send("This URL is Invalid.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
});
