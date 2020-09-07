const express = require('express');
const cors = require('cors')
const app = express();

app.use(express.static(__dirname + '/public/'));

app.listen('3000', function() {
  console.log('Servidor web escuchando en el puerto 3000');
});

const https = require('https')

app.get('/api/items', cors(), function(req, res) {
	const searchOptions = {
	  hostname: 'api.mercadolibre.com',
	  port: 443,
	  path: '/sites/MLA/search?q=' + req.query.search,
	  method: 'GET'
	}
    const httpsReq = https.request(searchOptions, httpsRes => {
		var results = ''
        httpsRes.on('data', d => {
			results += d
        })
		httpsRes.on('end', function () {
			const resultsJSON = JSON.parse(results)
			const resultsFormatted = {author:{name:'',lastname:''},categories:[]}
			resultsFormatted.items = resultsJSON.results.map((item)=>{return {id: item.id, title: item.title, price: { currency: item.currency_id, amount: parseInt(item.price),decimals:item.price-parseInt(item.price)},picture: item.thumbnail, condition: item.condition, free_shipping: item.shipping.free_shipping, state: item.address.state_name}})
			const resultsStr = JSON.stringify(resultsFormatted)
			res.send(resultsStr);
		});
    })
      
    httpsReq.on('error', error => {
        console.error(error)
    })
    
    httpsReq.end()
});


app.get('/api/items/:id', cors(), function(req, res) {

	var item = undefined
	
	const searchOptions1 = {
	  hostname: 'api.mercadolibre.com',
	  port: 443,
	  path: '/items/' + req.params.id,
	  method: 'GET'
	}
    const httpsReq1 = https.request(searchOptions1, httpsRes => {
		var result = ''
        httpsRes.on('data', d => {
			result += d
        })
		httpsRes.on('end', function () {
			item = JSON.parse(result)
    
			const searchOptions2 = {
			  hostname: 'api.mercadolibre.com',
			  port: 443,
			  path: '/items/' + req.params.id + '/description',
			  method: 'GET'
			}
			const httpsReq2 = https.request(searchOptions2, httpsRes => {
				var description = ''
				httpsRes.on('data', d => {
					description += d
				})
				httpsRes.on('end', function () {
					const descriptionJSON = JSON.parse(description)
					item.description = descriptionJSON
					const itemFormatted = {id: item.id, title: item.title, price: {currency: item.currency_id, amount: parseInt(item.price), decimals: item.price-parseInt(item.price)}, picture: item.pictures && item.pictures.length > 0 ? item.pictures[0].url : '', condition: item.condition, free_shipping: item.shipping ? item.shipping.free_shipping : false, sold_quantity: item.sold_quantity, description: item.description ? item.description.plain_text : ''}
					const itemStr = JSON.stringify(itemFormatted)
					res.send(itemStr);
				});
			})
			httpsReq2.on('error', error => {
				console.error(error)
			})
			httpsReq2.end()
		});
    })
    httpsReq1.on('error', error => {
        console.error(error)
    })
	httpsReq1.end()
});
