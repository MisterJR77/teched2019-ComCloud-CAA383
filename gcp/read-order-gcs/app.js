/** imports
 */ 

// google cloud client library
const { Storage } = require('@google-cloud/storage');


//setup through binding
//decode base64 to string
var privateKeyString = Buffer.from(process.env.PrivateKeyData, 'base64').toString('ascii')

//Parse Service account key -> credential
const privateKey = JSON.parse(privateKeyString);

//innitialize connection to gcs
const storage = new Storage({
    projectId: process.env.ProjectId,
    credentials: privateKey
});

//get access to bucket
const myBucket = storage.bucket(process.env.bucket_name);

/* Begin actual lambda function
*/

module.exports = {

    //async function to enable promise handling through await
    main: async function (event, context) {

        //get order code from query parameters and handle error
        var orderCode = event.extensions.request.query.orderCode;

        if (typeof orderCode == 'undefined') {
            console.log("query parameter orderCode undefined");
            event.extensions.response.status(400).json({ error: "query parameter orderCode undefined" });
        } else {

            console.log(`Order Code: ${orderCode}`)
            try {
                // read file from storage bucket
                var fileName = `${orderCode}.json`
                var file = myBucket.file(fileName);

                var result = await file.download()
                //log response
                console.log(`File ${fileName}:`)
                console.log(result)
                //converting binary to string..
                return result[0].toString();
            } catch (error) {
                console.log(`something went wrong reading order for code ${orderCode}`);
                event.extensions.response.status(500).json({ error: `something went wrong reading order for code ${orderCode}` });
            }
        }



    }
}