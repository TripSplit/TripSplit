// Wait until the window finishes loaded before executing any script
window.onload = function() {

    var totalCost, totalNights;
    let orgPersons = [];
    let orgNights = [];
    var orgCosts = [];

    var recal = 1;
    var making_changes = false;
    
    // Initialize the personNumber
    var personNumber = 0;
    var addedNumber = 0;

    // Assign buttons to variables
    var addButton = document.getElementById("add_person");
    var calcButton = document.getElementById("calculate");
    var reCalcButton = document.getElementById("make_changes");
    var redistButton = document.getElementById("redistribute");

    // Select the table element
    var calcTableJS = document.getElementById("calcTable");
    var recalTableJS = document.getElementById("recalTable");
    var redisTableJS = document.getElementById("redisTable");
    var calcResultTableJS = document.getElementById("calcResultTable");


    // list of remove buttons
    var removeButtonList = [];
    var newRemoveButtonList = [];

    // Select the table element
    var resultTable = document.getElementById("resultlist");

    const stay = new Stay(document.getElementById("totalCost").value, document.getElementById("totalNights").value);

    // Attach handler to the button click events
    addButton.onclick = addPerson;
    calcButton.onclick = calculate;
    reCalcButton.onclick = make_changes;
    redistButton.onclick = redistribute;

    // Calling addPerson so that the page is not empty on load
    addPerson();

    function addPerson(){
        // Add a new row to the table using the correct personNumber

        if (making_changes){
            newPerson = recalTableJS.insertRow();
            newPerson.innerHTML = '<td> \
                <button class="button-rm" id="new-rm-button-' + (addedNumber+1).toString() + '" type="button"> <i class="fa fa-trash"></i></button> \
                <input type="text" name="AddReperson' + (addedNumber+1).toString() + '" id="AddReperson' + (addedNumber+1).toString() + '"  value="" placeholder="Name">';
            
            // Function for remove button
            $("#new-rm-button-" + (addedNumber+1).toString()).on("click", function() {
                $(this).closest("tr").remove();
                });

            recal++;


            totalNights = document.getElementById("totalNights").value;

            AddRepersons = document.querySelectorAll('[id^="AddReperson"]');
            addedLength = AddRepersons.length;

            for(var i=0; i < totalNights; i++){ // Add checkboxes
                recalTableJS.rows[recalTableJS.rows.length-1].insertAdjacentHTML("beforeend", '<input type="checkbox" name="addcb'+(addedNumber+1).toString()+'" id="addcb'+(addedNumber+1).toString()+'"/>'); 
            }
            addedNumber += 1;     

        }
        else{
            newPerson = calcTableJS.insertRow();
            newPerson.innerHTML = '<tr><td> \
                <button class="button-rm" id="rm-button-' + (personNumber+1).toString() + '" type="button"> <i class="fa fa-trash"></i></button><input type="text" name="person' + (personNumber+1).toString() + '" id="person' + (personNumber+1).toString() + '" class="required" placeholder="Name">';

            // Function for remove button
            $("#rm-button-" + (personNumber+1).toString() ).on("click", function() {
                $(this).closest("tr").remove();

            });


            totalNights = document.getElementById("totalNights").value;

            for(var i=0; i < totalNights; i++){ // Add checkboxes
                calcTableJS.rows[calcTableJS.rows.length-1].insertAdjacentHTML("beforeend", '<input type="checkbox" name="cb'+(personNumber+1).toString()+'" id="cb'+(personNumber+1).toString()+'"/>'); 
            }
            personNumber += 1;

        }    
        
        
    }

    function calculate(){

        orgPersons = [];
        orgNights = [];
        totalCost = document.getElementById("totalCost").value;
        totalNights = document.getElementById("totalNights").value;
    
        const stay = new Stay(totalCost, totalNights);

        var persons, nights, index;
        

        persons = document.querySelectorAll('[id^="person"]');
        var personsArr = Array.from(persons);

        nights = document.querySelectorAll('[id^="nights"]');
        var nightsArr = Array.from(nights);

        //Checkboxes get turned into arrays here
        for (index = 0; index < personsArr.length; index++) {
            person_idx = personsArr[index].getId;

            var checkBoxes = document.querySelectorAll('[name="cb'+personsArr[index].name.match(/\d+$/)+'"]');

            var per, night=[];

            per = personsArr[index].value;
            orgPersons.push(per);

            // Grab nights each person is staying
            for(var j = 0; j < totalNights; j++){
                if(checkBoxes[j] == null){ // Check if checkbox exists
                    continue;
                }
                else{
                    if(checkBoxes[j].checked){
                        night.push(j);
                    }
                }
            }

            orgNights.push(night);

            if(stay.AddPerson(per, night)) // Add person function returns false if name already added
            {
                //No error, continue
            }
            else
            {
                calcResultTableJS.insertAdjacentHTML("beforeend", '<tr><td><label class="error">Error: Check that all names are different.</label><label></label><br/></td></tr>');
                return 0;
            }
        }


        orgCosts = stay.CalculateOriginalCosts();

        let totalCostDifference = Math.abs(orgCosts.reduce((partialSum,a) => partialSum+a, 0) - totalCost);

        // Error check
        if(totalCostDifference > 1e-3 )
        {
            calcResultTableJS.innerHTML = '';
            for (index = 0; index < orgCosts.length; index++) {
                calcResultTableJS.insertAdjacentHTML("beforeend", '<tr><td><label>' + orgPersons[index] + ': $</label><label>' + orgCosts[index].toFixed(2) + '</label><br/></td></tr>');
            }
            calcResultTableJS.insertAdjacentHTML("beforeend", '<tr><td><label class="warning">Warning: Attendee costs do not add up to total cost ($'+totalCostDifference.toFixed(2)+' missing). Check to see if each night has a traveler attending.</label><label></label><br/></td></tr>');
        }  
        else
        {
            calcResultTableJS.innerHTML = '';
            for (index = 0; index < orgCosts.length; index++) {
                calcResultTableJS.insertAdjacentHTML("beforeend", '<tr><td><label>' + orgPersons[index] + ': $</label><label>' + orgCosts[index].toFixed(2) + '</label><br/></td></tr>');
            }
        }


        document.getElementById("make_changes").disabled = false;

    }


    function make_changes(){
        var persons, nights, index;

        persons = document.querySelectorAll('[id^="person"]');
        var personsArr = Array.from(persons);

        for(index = 0; index < personsArr.length; index++){
            document.getElementById("person" + personsArr[index].name.match(/\d+$/)).disabled = true;
            document.getElementById('rm-button-'+personsArr[index].name.match(/\d+$/)).disabled = true;
        }

        checkboxes = document.querySelectorAll('[id^="cb"]');
        for(var i = 0; i < checkboxes.length; i++){
            checkboxes[i].disabled = true;
        }
        
        document.getElementById("totalCost").disabled = true;
        document.getElementById("totalNights").disabled = true;

        making_changes = true;
        recal = 1;

        recalTableJS.insertAdjacentHTML("beforeend", '<th>Modifications:</th><th>Nights</th>');        
        
        var iter = 1;

        for (index = 0; index < orgPersons.length; index++) {

            recalTableJS.insertAdjacentHTML("beforeend", '<tr><td><label name="reperson' + recal + '" id="reperson' + recal + '">' + orgPersons[index] + ' </label> \
            ');

            for(var i=0; i < totalNights; i++){
                if(orgNights[index].includes(i)){
                    recalTableJS.rows[iter].insertAdjacentHTML("beforeend", '<input type="checkbox" name="recb'+iter+'" id="recb'+iter+'" checked>'); 
                }
                else{
                    recalTableJS.rows[iter].insertAdjacentHTML("beforeend", '<input type="checkbox" name="recb'+iter+'" id="recb'+iter+'"/>'); 
                }
            }
            iter++;
            recal++;
        }

        document.getElementById("calculate").disabled = true;
        document.getElementById("make_changes").disabled = true;
        document.getElementById("redistribute").disabled = false;
        document.getElementById("add_person").disabled = false;


    }

    function redistribute(){
        var index;
        let repersons = [];
        let renights = [];

        const stay = new Stay(totalCost, totalNights);

        for (index = 0; index < orgPersons.length; index++) {

            if(stay.AddPerson(orgPersons[index],  orgNights[index]))
            {
                // No error, continue
            }
            else
            {
                redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label class="error">Error: Check that all names are different.</label><label></label><br/></td></tr>');
                return 0;
            }
        }

        stay.CalculateOriginalCosts();

        repersons = document.querySelectorAll('[id^="reperson"]');
        var repersonsArr = Array.from(repersons);
        var renightsArr = [];

        ////
        for (index = 0; index < repersonsArr.length; index++) {
            var ReCheckBoxes = document.querySelectorAll('[name="recb'+(index+1)+'"]');
            var night =[];

            for(var j = 0; j < totalNights; j++){
                
                if(ReCheckBoxes[j].checked){
                    night.push(j);
                }
            }
            renightsArr.push(night);
        }
        ////

        AddRepersons = document.querySelectorAll('[id^="AddReperson"]');
        var AddRepersonsArr = Array.from(AddRepersons);
        var AddRenightsArr = [];

        ////
        for (index = 0; index < AddRepersons.length; index++) {
            var AddReCheckBoxes = document.querySelectorAll('[name="addcb'+AddRepersonsArr[index].name.match(/\d+$/)+'"]');
            var night =[];

            for(var j = 0; j < totalNights; j++){
                
                if(AddReCheckBoxes[j].checked){
                    night.push(j);
                }
            }
            AddRenightsArr.push(night);
        }
        ////
        
        
        for (index=0; index < repersonsArr.length; index++){

            isDiff = !(Array.isArray(renightsArr[index]) && Array.isArray(orgNights[index]) && renightsArr[index].length === orgNights[index].length && renightsArr[index].every((val, j) => val === orgNights[index][j]));

            
            if (isDiff){
                stay.ChangePersonNights(repersonsArr[index].innerText, renightsArr[index])
            }
        }

        for (index = 0; index < AddRepersons.length; index++) {
            if(stay.AddPerson(AddRepersonsArr[index].value, AddRenightsArr[index]))
            {
               // No error, continue 
            }
            else
            {
                redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label class="error">Error: Check that all names are different.</label><label></label><br/></td></tr>');
                return 0;
            }
            
        }

        newCosts = stay.CalculateRedistribution();

        let totalCostDifference = Math.abs(newCosts.reduce((partialSum,a) => partialSum+a, 0) - totalCost);

        if(totalCostDifference > 1e-3 )
        {
            redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>Money Redistribution:</b></label><br/></td></tr>');

            redisTableJS.innerHTML = '';
            for (index = 0; index < stay.num_guests; index++) {
                redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>' + stay.name_list[index] + '</b> is staying ' + stay.nights_staying_list[index].length + ' nights. <b>Total Cost</b>: $</label><label><b>' + stay.person_shareprice_list_new[index].toFixed(2) + '</b></label><br/></td></tr>');
            }
    
            redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><br/></td></tr>');
            
            for (index = 0; index < stay.num_guests; index++) {
                redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>' + stay.name_list[index] + '</b> should ' + ((stay.amount_to_send[index] > 0) ? '<b>send</b>' : '<b>receive</b>') + ': $</label><label><b>' + Math.abs(stay.amount_to_send[index]).toFixed(2) + '</b></label><br/></td></tr>');
            }

            redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label class="warning">Warning: Attendee costs do not add up to total cost ($'+totalCostDifference.toFixed(2)+' missing). Check to see if each night has a traveler attending.</label><label></label><br/></td></tr>');
        }
        else
        {
            redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>Money Redistribution:</b></label><br/></td></tr>');

            redisTableJS.innerHTML = '';
            for (index = 0; index < stay.num_guests; index++) {
                redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>' + stay.name_list[index] + '</b> is staying ' + stay.nights_staying_list[index].length + ' nights. <b>Total Cost</b>: $</label><label><b>' + stay.person_shareprice_list_new[index].toFixed(2) + '</b></label><br/></td></tr>');
            }
    
            redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><br/></td></tr>');
            
            for (index = 0; index < stay.num_guests; index++) {
                redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>' + stay.name_list[index] + '</b> should ' + ((stay.amount_to_send[index] > 0) ? '<b>send</b>' : '<b>receive</b>') + ': $</label><label><b>' + Math.abs(stay.amount_to_send[index]).toFixed(2) + '</b></label><br/></td></tr>');
            }
        }
        


    }

    document.getElementById("totalNights").addEventListener("change", function() {
        var checkBoxes = document.querySelectorAll('[type="checkbox"]');
        var index = 0;

        for (index = 0; index < checkBoxes.length; index++){
            checkBoxes[index].remove();
        }

        persons = document.querySelectorAll('[id^="person"]');
        var personsArr = Array.from(persons);

        totalNights = document.getElementById("totalNights").value;

        for (var iter=1; iter < calcTableJS.rows.length; iter++){
            person_idx = personsArr[iter-1].getId;

            for(var i=0; i < totalNights; i++){
                calcTableJS.rows[iter].insertAdjacentHTML("beforeend", '<input type="checkbox" name="cb'+personsArr[iter-1].name.match(/\d+$/)+'" id="cb'+personsArr[iter-1].name.match(/\d+$/)+'"/>'); 
            }
        }
    }, false);


    document.getElementById("footer-share-button").onclick = function() {


         /* Copy the text inside the text field */
        navigator.clipboard.writeText("https://tripsplit.io/");
      
        /* Alert the copied text */
        // alert("Copied site link https://tripsplit.io/ to clipboard!");
        document.getElementById('share-alert').innerHTML = 'Copied site link https://tripsplit.io/ to clipboard!';
        
        setTimeout(function(){
            document.getElementById('share-alert').innerHTML = '';
        },5000);
        

      }


    helpClicked = false;
    document.getElementById("help").onclick = function() {
        helpArea = document.getElementById("instructions");
        if(helpClicked)
        {
            helpArea.innerHTML = '';
            helpClicked = false;
        }
        else
        {
            helpArea.innerHTML = '<b>Instructions:</b>\
            <ul>\
               <li>Total Cost: The total cost of the trip</li>\
               <li>Total Number of Nights: Enter the number of nights you will be staying</li>\
               <li>Add Person: Click until you have the amount of people attending the trip</li>\
               <li>Name: Add the names of each traveler</li>\
               <li>Nights: Click on the checkboxes for the nights each person is staying</li>\
               <li>Click ???Calculate???</li>\
            </ul>\
            <br></br>\
            <b>Change of Plans?</b>\
            <ul>\
                <li>Click ???Make Changes???</li>\
                <li>Follow the same steps as above (ie. adding people & changing nights)</li>\
                <li>Click ???Redistribute???</li>\
            </ul>\
            <br></br>\
            <b>Need to make a new calculation?</b>\
            <p>Click "Start Over"</p><br></br>';
            helpClicked = true;
        }
    }
}