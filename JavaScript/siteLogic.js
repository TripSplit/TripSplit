// Wait until the window finishes loaded before executing any script
window.onload = function() {

    var totalCost, totalNights;
    let orgPersons = [];
    let orgNights = [];
    var orgCosts = [];

    var recal = 1;
    var recalculating = false;
    
    // Initialize the activityNumber
    var activityNumber = 1;

    // Select the add_activity button
    var addButton = document.getElementById("add_activity");

    // Select the calculate button
    var calcButton = document.getElementById("calculate");

    // Select the table element
    var calcTableJS = document.getElementById("calcTable");
    var recalTableJS = document.getElementById("recalTable");
    var redisTableJS = document.getElementById("redisTable");
    var calcResultTableJS = document.getElementById("calcResultTable");

    // Select the table element
    var resultTable = document.getElementById("resultlist");

    const stay = new Stay(document.getElementById("totalCost").value, document.getElementById("totalNights").value);

    // Attach handler to the button click event
    addButton.onclick = function() {

    // Add a new row to the table using the correct activityNumber

        if (recalculating){
        recalTableJS.insertAdjacentHTML("beforeend", '<tr><td><label>Person</label> \
            <input type="text" name="reperson' + recal + '" id="AddReperson' + recal + '"  value="" placeholder="Name">');
            //<input type="text" name="renights' + recal + '" id="AddRenights' + recal + '" value="" placeholder="Nights"></td></tr>');
            recal++;
        }
        else{
        calcTableJS.insertAdjacentHTML("beforeend", '<tr><td><label>Person ' + activityNumber + ': </label> \
            <input type="text" name="person' + activityNumber + '" id="person' + activityNumber + '" class="required" placeholder="Name">');
            //<input type="text" id="nights' + activityNumber + '" name="nights' + activityNumber + '" value="" placeholder="Nights"></td></tr>');
            activityNumber += 1;
        }    
        
        //TODO: This is repeated code because bababooey. Fix
        var checkBoxes = document.querySelectorAll('[type="checkbox"]');
        var index = 0;

        for (index = 0; index < checkBoxes.length; index++){
            checkBoxes[index].remove();
        }

        var table = document.getElementById("calcTable"), iter = 0;
        totalNights = document.getElementById("totalNights").value;

        for (iter=1; iter < table.rows.length; iter++){
            //var trow = $(this);
            for(var i=0; i < totalNights; i++){
                table.rows[iter].insertAdjacentHTML("beforeend", '<input type="checkbox" name="cb'+iter+'" id="cb'+iter+'"/>'); 
            }
        }
    }

    document.getElementById("calculate").addEventListener("click", function() {


        orgPersons = [];
        orgNights = [];
        totalCost = document.getElementById("totalCost").value;
        totalNights = document.getElementById("totalNights").value;
        var checkBoxes = document.querySelectorAll('[type="checkbox"]');

        //alert(checkBoxes[0].value);
        const stay = new Stay(totalCost, totalNights);

        var persons, nights, index;
        
        persons = document.querySelectorAll('[id^="person"]');
        var personsArr = Array.from(persons);

        nights = document.querySelectorAll('[id^="nights"]');
        var nightsArr = Array.from(nights);

        var j = 0;

        for (index = 0; index < personsArr.length; index++) {
            var per, night="";

            per = personsArr[index].value;
            orgPersons.push(per);
            for(j = j; j < totalNights; j++){
                if(checkBoxes[index].checked){
                    night+=j;
                }
            }
           // night = checkBoxes[index].value;
           //night = nightsArr[index].value;

            orgNights.push(night);
            alert(night);
            stay.AddPerson(per,  Array.from(String(night), Number));

            j+=totalNights;
        }

        orgCosts = stay.CalculateOriginalCosts();

        calcResultTableJS.innerHTML = '';
        for (index = 0; index < orgCosts.length; index++) {
            calcResultTableJS.insertAdjacentHTML("beforeend", '<tr><td><label>' + orgPersons[index] + ': $</label><label>' + orgCosts[index].toFixed(2) + '</label><br/></td></tr>');
        }

        document.getElementById("recalculate").disabled = false;

    }, false);


    document.getElementById("recalculate").addEventListener("click", function() {

        var persons, nights, index;

        persons = document.querySelectorAll('[id^="person"]');
        nights = document.querySelectorAll('[id^="nights"]');

        for(index = 1; index <= persons.length; index++){
            document.getElementById("person" + index).disabled = true;
            document.getElementById("nights" + index).disabled = true;
        }
        
        document.getElementById("totalCost").disabled = true;
        document.getElementById("totalNights").disabled = true;

        recalculating = true;
        recal = 1;

        recalTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>Modifications:</b></label></td></tr>');

        for (index = 0; index < orgPersons.length; index++) {
            recalTableJS.insertAdjacentHTML("beforeend", '<tr><td><label>' + orgPersons[index] + ' </label><br/> \
            <input type="text" name="reperson' + recal + '" id="reperson' + recal + '"  value="' + orgPersons[index] + '"> \
            <input type="text" name="renights' + recal + '" id="renights' + recal + '" value="' + orgNights[index] + '" ></td></tr>');
            recal++;
        }

        document.getElementById("calculate").disabled = true;
        document.getElementById("recalculate").disabled = true;
        document.getElementById("redistribute").disabled = false;
        document.getElementById("add_activity").disabled = false;


    }, false);

    document.getElementById("redistribute").addEventListener("click", function() {

        var index;
        let repersons = [];
        let renights = [];

        const stay = new Stay(totalCost, totalNights);

        for (index = 0; index < orgPersons.length; index++) {
            stay.AddPerson(orgPersons[index],  Array.from(String(orgNights[index]), Number));
        }

        stay.CalculateOriginalCosts();
        
        repersons = document.querySelectorAll('[id^="reperson"]');
        var repersonsArr = Array.from(repersons);
        renights = document.querySelectorAll('[id^="renights"]');
        var renightsArr = Array.from(renights);

        AddRepersons = document.querySelectorAll('[id^="AddReperson"]');
        var AddRepersonsArr = Array.from(AddRepersons);
        AddRenights = document.querySelectorAll('[id^="AddRenights"]');
        var AddRenightsArr = Array.from(AddRenights);

        for (index=0; index < repersonsArr.length; index++){

            if (renightsArr[index].value != orgNights[index]){
                stay.ChangePersonNights(repersonsArr[index].value, Array.from(String(renightsArr[index].value), Number))
            }

        }

        for (index = 0; index < AddRepersons.length; index++) {
            stay.AddPerson(AddRepersonsArr[index].value, Array.from(String(AddRenightsArr[index].value), Number))
        }

        stay.CalculateRedistribution();


        redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>Money Redistribution:</b></label><br/></td></tr>');

        redisTableJS.innerHTML = '';
        for (index = 0; index < stay.num_guests; index++) {
            redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>' + stay.name_list[index] + '</b> is staying ' + stay.nights_staying_list[index].length + ' nights and <b>owes</b>: $</label><label><b>' + stay.person_shareprice_list_new[index].toFixed(2) + '</b></label><br/></td></tr>');
        }

        redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><br/></td></tr>');
        
        for (index = 0; index < stay.num_guests; index++) {
            redisTableJS.insertAdjacentHTML("beforeend", '<tr><td><label><b>' + stay.name_list[index] + '</b> should ' + ((stay.amount_to_send[index] > 0) ? '<b>send</b>' : '<b>receive</b>') + ': $</label><label><b>' + Math.abs(stay.amount_to_send[index]).toFixed(2) + '</b></label><br/></td></tr>');
        }

    }, false);

    document.getElementById("totalNights").addEventListener("change", function() {
        var checkBoxes = document.querySelectorAll('[type="checkbox"]');
        var index = 0;

        for (index = 0; index < checkBoxes.length; index++){
            checkBoxes[index].remove();
        }

        var table = document.getElementById("calcTable"), iter = 0;
        totalNights = document.getElementById("totalNights").value;

        for (iter=1; iter < table.rows.length; iter++){
            //var trow = $(this);
            for(var i=0; i < totalNights; i++){
                table.rows[iter].insertAdjacentHTML("beforeend", '<input type="checkbox" name="cbRow'+iter+'Day'+i+'" id="cb'+iter+'Day'+i+'"/>'); 
            }
        }
        //iter++
    }, false);

}