// Wait until the window finishes loaded before executing any script
window.onload = function() {

    var totalCost, totalNights;
    let orgPersons = [];
    let orgNights = [];
    var orgCosts = [];

    var recal = 1;
    var recalculating = false;
    
    // Initialize the personNumber
    var personNumber = 1;

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

        if (recalculating){
        recalTableJS.insertAdjacentHTML("beforeend", '<tr><td> \
            <input type="text" name="AddReperson' + recal + '" id="AddReperson' + recal + '"  value="" placeholder="Name">');
            recal++;
            
            totalNights = document.getElementById("totalNights").value;

            AddRepersons = document.querySelectorAll('[id^="AddReperson"]');
            addedLength = AddRepersons.length;

            for(var i=0; i < totalNights; i++){
                recalTableJS.rows[recalTableJS.rows.length-1].insertAdjacentHTML("beforeend", '<input type="checkbox" name="addcb'+(addedLength)+'" id="addcb'+(addedLength)+'"/>'); 
            }
        }
        else{
        calcTableJS.insertAdjacentHTML("beforeend", '<tr><td> \
            <input type="text" name="person' + personNumber + '" id="person' + personNumber + '" class="required" placeholder="Name">');
            personNumber += 1;

            totalNights = document.getElementById("totalNights").value;

            for(var i=0; i < totalNights; i++){
                calcTableJS.rows[calcTableJS.rows.length-1].insertAdjacentHTML("beforeend", '<input type="checkbox" name="cb'+(calcTableJS.rows.length-1)+'" id="cb'+(calcTableJS.rows.length-1)+'"/>'); 
            }
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
        console.log({orgNights,nights,nightsArr});

        //Checkboxes get turned into arrays here
        for (index = 0; index < personsArr.length; index++) {
            var checkBoxes = document.querySelectorAll('[name="cb'+(index+1)+'"]');

            var per, night=[];

            per = personsArr[index].value;
            orgPersons.push(per);
            for(var j = 0; j < totalNights; j++){
                if(checkBoxes[j].checked){
                    night.push(j);
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

        for(index = 1; index <= persons.length; index++){
            document.getElementById("person" + index).disabled = true;
        }

        checkboxes = document.querySelectorAll('[id^="cb"]');
        for(var i = 0; i < checkboxes.length; i++){
            checkboxes[i].disabled = true;
        }
        
        document.getElementById("totalCost").disabled = true;
        document.getElementById("totalNights").disabled = true;

        recalculating = true;
        recal = 1;

        recalTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>Modifications:</b></label></td><td><label><b>Nights</b></label></td></tr>');

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
            var AddReCheckBoxes = document.querySelectorAll('[name="addcb'+(index+1)+'"]');
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
            // stay.AddPerson(AddRepersonsArr[index].value, AddRenightsArr[index])
            if(stay.AddPerson(AddRepersonsArr[index].value, AddRenightsArr[index]))
            {
               // No error, continue 
            }
            else
            {
                console.log('Should be error siteLogic')
                redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label class="error">Error: Check that all names are different.</label><label></label><br/></td></tr>');
                // stay.RemovePerson(AddRepersonsArr[index].value);
                return 0;
            }
            
        }

        stay.CalculateRedistribution();


        
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

    document.getElementById("totalNights").addEventListener("change", function() {
        var checkBoxes = document.querySelectorAll('[type="checkbox"]');
        var index = 0;

        for (index = 0; index < checkBoxes.length; index++){
            checkBoxes[index].remove();
        }

        totalNights = document.getElementById("totalNights").value;

        for (var iter=1; iter < calcTableJS.rows.length; iter++){
            for(var i=0; i < totalNights; i++){
                calcTableJS.rows[iter].insertAdjacentHTML("beforeend", '<input type="checkbox" name="cb'+iter+'" id="cb'+iter+'"/>'); 
            }
        }
    }, false);

}