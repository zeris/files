const papaparse = require('papaparse');
const csvparser = require('csvtojson');
const fs = require('fs');
const moment = require('moment');
const paths = require('./config/paths');

let files = 
{
    createCSV : function(data)
    {
        return new Promise(function(resolve, reject){
            let csvData = papaparse.unparse(data);
            let csvName = paths.csv + moment().format("X") + ".csv";
            file.createFile(csvName, csvData)
            .then((csv)=>
            {
                resolve(csv);
            },(errCreateFile)=>
            {
                reject(errCreateFile);
            });
        });
    },
    deleteCSV : function(csvName)
    {
        return new Promise(function(resolve, reject)
        {
            fs.unlink(csvName, (error)=>{
                if(error)
                {
                    error.descripcion = "No se pudo eliminar el archivo CSV"
                    reject({
                        err : error,
                        errCode : 214
                    })
                }
                else
                {
                    resolve({});
                }
            });
        });
    },
    createJSON : function(csvPath, nameJSONFile)
    {
        return new Promise(function(resolve, reject){
            csvparser()
            .fromFile(csvPath)
            .then((jsonData)=>
            {
                jsonData.forEach(elemento=>{
                    elemento["montoNocional"] = parseFloat(elemento["montoNocional"])
                })

                let jsonName = paths.json + nameJSONFile + ".json";
                files.createFile(jsonName, JSON.stringify(jsonData))
                .then((csv)=>
                {
                    resolve(csv);
                },(errCreateFile)=>
                {
                    console.log(errCreateFile.err)
                    reject(errCreateFile);
                });
            });
        });
    },
    createMultipleJSON : function(folderPath)
    {
        return new Promise(function(resolve,reject)
        {
            files.getFiles(folderPath)
            .then((csvFiles)=>
            {
                csvFiles.files.forEach(nameFile => {
                    files.createJSON(folderPath + "/" + nameFile, nameFile)
                    .then((jsonFile)=>
                    {
                        resolve(jsonFile);
                    })
                    .catch((errorCreateJSON)=>
                    {
                        reject(errorCreateJSON);
                    });
                });  
            })
            .catch((errorCreateJSON)=>
            {
                reject(errorCreateJSON);
            });
        });
    },
    deleteJSON : function(jsonName)
    {
        return new Promise(function(resolve, reject)
        {
            fs.unlink(jsonName, (error)=>{
                if(error)
                {
                    error.descripcion = "No se pudo eliminar el archivo JSON"
                    reject({
                        err : error,
                        errCode : 314
                    })
                }
                else
                {
                    resolve({});
                }
            });
        });
    },
    getFiles : function(folderPath)
    {
        return new Promise(function (resolve, reject)
        {
            fs.readdir(folderPath, (err, files) => {
                if(err)
                {
                    reject({
                        err: error,
                        errCode: 24
                    })
                }
                resolve({
                    files : files
                });
            });
        });
    },
    createFile : function(nameFile, dataFile)
    {
        return new Promise(function (resolve, reject)
        {
            fs.appendFile(nameFile, dataFile,  { mode: 0o755 } , (error)=>
            {
                if(error)
                {
                    error.descripcion = "Error al crear el csv";
                    reject({
                        err : error,
                        errCode: 13
                    });
                }
                else
                {
                    resolve({
                        fileName : nameFile,
                        filePath : fs.realpathSync(nameFile, [])
                    });
                }
            });
        });
    }
}

module.exports = files;