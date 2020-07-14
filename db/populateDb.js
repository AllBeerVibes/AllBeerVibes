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
                
                if(d[1] == obj[n].beer_name && d[2] == obj[n].brand_name) {
                    check = false;
                }
                n++;
            }
            
            //add data if the data is not duplicated with db
            if(check == true)
            {
                obj.push({
                    untappd_bid: d[0], 
                    style: d[1],
                    beer_name: d[2],
                    brewery_name: d[3],
                    award_category: d[4],
                    award_title: d[5],
                    
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


