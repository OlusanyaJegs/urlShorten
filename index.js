const express = require('express');
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const validUrl = require('valid-url');
const PORT = 4000;
const db = require('./data/urls.json');

const app = express();

const cors = require('cors');

app.use(cors());

const schema = buildSchema(`
    type Url {
        name: String!
        originalUrl: String!,
        shortUrl: String
    }

    type UrlFeed {
        shortId: String,
        shortenedUrl: String,
        originalUrl: String
    }

    type Query {
        getUrls: [Url!],
    }

    type Mutation {
        shortUrl(url: String): UrlFeed
    }

`);

const urlMap = {};

const rootValue = {
    shortUrl: ({ url }) => {

        if (!validUrl.isUri(url)) {
            throw new Error("This URL is Invalid.");
        }

        const shortId = (Math.random() + 1).toString(36).substring(6);
        urlMap[shortId] = url;

        return {
            shortId,
            shortenedUrl: `http://localhost:4000/graphql/${shortId}`,
            originalUrl: url
        }
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

};

app.use("/graphiql", graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
}));


app.use("/graphql/:shortUrl", async (req, res) => {
    const { shortUrl } = req.params;

    const url = urlMap[shortUrl];

    if (url) {
        res.redirect(url);
    } else {
        res.send("This URL is Invalid.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
});
