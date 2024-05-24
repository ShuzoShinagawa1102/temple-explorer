const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());

app.get('/api/temple', async (req, res) => {
  const place = req.query.keyword || '';
  const limit = req.query.limit || 10;
  console.log(`Received search keyword: ${place} with limit: ${limit}`);

// TODO : Not working well...

//   const query = `
//     PREFIX dbr: <http://dbpedia.org/resource/>
//     PREFIX dbo: <http://dbpedia.org/ontology/>
//     PREFIX gold: <http://purl.org/linguistics/gold/>
//     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

//     SELECT ?temple ?label ?description ?thumbnail
//     WHERE {
//       ?temple dbo:wikiPageWikiLink dbr:${place} ;
//               rdfs:label ?label ;
//               dbo:abstract ?description ;
//               dbo:thumbnail ?thumbnail .
//       {
//         ?temple dbo:wikiPageWikiLink dbr:Temple
//       }
//       UNION
//       {
//         ?temple gold:hypernym dbr:Temple
//       }
//       FILTER (lang(?description) = "ja")
//       FILTER (lang(?label) = "ja")
//     }
//     LIMIT ${limit}
// `;

  const query = `
    PREFIX dbr: <http://dbpedia.org/resource/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX gold: <http://purl.org/linguistics/gold/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?temple ?label ?description ?thumbnail
    WHERE {
      ?temple dbo:wikiPageWikiLink dbr:${place} ;
              rdfs:label ?label ;
              gold:hypernym dbr:Temple ;
              dbo:abstract ?description ;
              dbo:thumbnail ?thumbnail .
      FILTER (lang(?description) = "ja")
      FILTER (lang(?label) = "ja")
    }
    LIMIT ${limit}
  `;


  console.log(`Generated SPARQL query: ${query}`);
  const url = `http://dbpedia.org/sparql?query=${encodeURIComponent(query)}`;
  const headers = {
    'Accept': 'application/sparql-results+json'
  };

  try {
    const response = await axios.get(url, { headers });
    const data = response.data.results.bindings;
    console.log('Received data from DBpedia:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
