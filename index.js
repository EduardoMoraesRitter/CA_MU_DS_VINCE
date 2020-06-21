var express = require('express');
var app = express();
var path = require('path');

app.use('/muni', express.static('muni'));

const https = require('https');
var querystring = require('querystring');

function httpsRequest(hostname, path, method, headers, body = {}) {
    return new Promise(function (resolve, reject) {
        const options = {
            hostname: hostname,
            path: path,
            method: method,
            headers: headers,
            rejectUnauthorized: false
        }
        const req = https.request(options, (res) => {
            var str = '';
            res.on('data', d => {
                str += d
            })
            res.on('end', () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    console.error("API utils res.statusCode: ", res.statusCode)
                    console.error("API utils httpsRequest: ", str)
                    console.error("API utils options: ", options)
                    console.error("API utils body: ", JSON.stringify(body))
                    resolve(res.statusCode)
                } else if (res.statusCode != 200) {
                    console.warn("API utils res.statusCode: ", res.statusCode)
                    console.warn("API utils httpsRequest: ", str)
                    console.warn("API utils options: ", options)
                    console.warn("API utils body: ", JSON.stringify(body))
                    resolve(res.statusCode)
                } else {
                    console.log("API utils request: ", path)
                    resolve(str)
                }
            })
        })
        req.write(body)
        req.end()
        req.on('error', function (e) {
            console.error("API utils httpsRequest: ", e)
            resolve(0)
        });
    })
}

async function getToken() {
    return new Promise(async function (resolve, reject) {
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        let body = {
            'apikey': 'c-MaC8NEy0LDY_wHNKyx0LhwnEei7bnAYFnXmQgxK1jp',
            'grant_type': 'urn:ibm:params:oauth:grant-type:apikey'
        };

        let retornoResquest = await httpsRequest(
            'iam.bluemix.net',
            '/oidc/token',
            'POST', 
            headers,
            querystring.stringify(body)
        );

        if (retornoResquest >= 300 || retornoResquest < 200) {
            console.error("BBBB ", retornoResquest)
            resolve(retornoResquest)
        }else{
            console.log("AAAAAAAAAAA retornoResquest:", retornoResquest)
            var aux = JSON.parse(retornoResquest)
            resolve(aux.access_token)
        }
    })
}

async function modelo(token, body) {
    return new Promise(async function (resolve, reject) {
        
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+token,
            'ML-Instance-ID': 'ba659903-440e-4610-850f-115a8070c983'
        }

        let retornoResquest = await httpsRequest(
            'us-south.ml.cloud.ibm.com',
            '/v3/wml_instances/ba659903-440e-4610-850f-115a8070c983/deployments/17615cbb-7d30-4cdf-8b8f-15db943bcca3/online',
            'POST', 
            headers,
            JSON.stringify(body)
        );

        if (retornoResquest >= 300 || retornoResquest < 200) {
            console.error("API salvaTopico erro status: ", retornoResquest)
            //resolve(false)
            return false
        } else {
            let data = JSON.parse(retornoResquest)
            if (data.results && data.results.length == 0) {
                console.error("API salvaTopico erro: ", retornoResquest)
                //resolve(false)
                return false

            } else {
                var aux = JSON.parse(retornoResquest)
                //return aux.values[0][0]
                resolve(aux.values[0][0])
                //data = data.results[0]
                //cep = data.address_components[0].long_name.replace('-', '')
                //console.log("BBBBBBBBBBBBBBBBBBBBBB ", retorno)
                //resolve(retorno)
            }
        }  
        
    })
}

app.get('/api', function (req, res) {

    res.json(req.headers)
    //return "aaaaa"
    
    //return event.headers.Cod_IBGE
    
    // let body = {
    //         "fields": [
    //             "Cod_IBGE",
    //             "Mortalidade_infantil",
    //             "IDHM_Educacao",
    //             "Renda_per_capita",
    //             "Grau_de_Urbanizacao",
    //             "Esgoto_Sanitario",
    //             "Estab_por_mil_Hab",
    //             "Doses_Aplicadas_mil_Hab",
    //             "Razao_Medico_mil_Hab",
    //             "Abastecimento_de_Agua",
    //             "Coleta_de_Lixo",
    //             "$KM-K-Means"
    //         ],
    //         "values": [
    //             [
    //                 event.headers.Cod_IBGE,
    //                 event.headers.Mortalidade_infantil,
    //                 event.headers.IDHM_Educacao,
    //                 event.headers.Renda_per_capita,
    //                 event.headers.Grau_de_Urbanizacao,
    //                 event.headers.Esgoto_Sanitario,
    //                 event.headers.Estab_por_mil_Hab,
    //                 event.headers.Doses_Aplicadas_mil_Hab,
    //                 event.headers.Razao_Medico_mil_Hab,
    //                 event.headers.Abastecimento_de_Agua,
    //                 event.headers.Coleta_de_Lixo,
    //                 'cluster-1'
    //             ]
    //         ]
    //     }
        
    // let token = await getToken()
    
    // return await modelo(token, body)
        
});

app.get('/', function (req, res) {
    //res.json("ok")
    res.sendFile(path.join(__dirname, 'simulador.html'));
});

app.listen(process.env.PORT || 5000, function () {
    console.log('foiiiii');
});