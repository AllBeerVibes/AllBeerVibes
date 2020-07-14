// To make beer DB on Mongo DB;

var fs = require('fs');

//first: make our own json file (this is a sample, we can change the format)
fs.readFile('./beer.txt', 'utf-8', (err,data) => {
    
    let database = data.split(/\r\n/);
    
    fs.readFile('./beer.json', 'utf8', function readFileCallback(err, dt){
        
        if (err){
            console.log(err);
        } else {
        
        var obj = JSON.parse(dt); //get current data as object
        
        for(var i=1; i<database.length; i++){

            var d = database[i].split(',');
            var check = true;
            var n = 0;
            
            //check if the data is already stroed in json
            while(check && n < obj.length) {
                
                if(d[0] == obj[n].beer_name && d[1] == obj[n].brand_name) {
                    check = false;
                }
                n++;
            }
            
            //add data if the data is not duplicated with db
            if(check == true)
            {
                obj.push({
                    beer_name: d[0], 
                    brand_name: d[1],
                    abv: d[2],
                    award_category: d[3],
                    beer_type: d[4],
                    brewery_name: d[5],
                    image_link: d[6],
                
            });
            } 
        }
        
        json = JSON.stringify(obj); //convert it back to store on json file
        
        fs.writeFile('./beer.json', json, (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
    }});

})

//Second: store json data on mongo DB


