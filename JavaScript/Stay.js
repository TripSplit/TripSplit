class Stay
{
    constructor(total_price, num_nights)
    {

        this.total_price = total_price;
        this.num_nights = num_nights;
        this.name_list = []; 
        this.nights_staying_list = [];

        // Total Cost each night
        this.per_night_total_cost = total_price/num_nights;

        // Flag for if original cost was calculated
        this.original_costs_calculated = false;
        this.num_guests = 0;

    }

    AddPerson(name, nights_staying)
    {
        // Check if person is already in the name list. We don't want duplicate names
        if(this.name_list.includes(name))
        {            
            // Figure out how to raise warnings/errors in JS if this is needed
            // raise AttributeError("Person {} already added to list. Change name to distinguish.".format(name))
        }

        // Check if person is staying after checkout.  Can't do this!
        if(!nights_staying.every(nights_staying => nights_staying < this.num_nights))
        {
            // raise AttributeError("Person {} cannot stay after the {}th night.".format(name, this.num_nights))
        }

        // Add the person and the nights staying to the appropriate lists
        if(!this.original_costs_calculated) // Before original cost calculated
        {
            this.nights_staying_list.push(nights_staying);
            this.name_list.push(name);
            this.num_guests++;
        } 
        else { // After original cost calculated
            this.nights_staying_list.push(nights_staying);
            this.name_list.push(name);
            this.person_shareprice_list_orig.push(0.0); // Adding cost of zero to original shareprice list for the new people
            this.num_guests += 1;
        }
    }

    CalculateOriginalCosts()
    {
        this.per_person_cost_each_night_orig = [];
        this.num_guests_each_night_orig = [];
        this.person_shareprice_list_orig = [];

        
        // Calculate per-night cost breakdown
        for(let i = 0; i < this.num_nights; i++)
        {
            let num_guests_tonight = 0;
            
            for(let j = 0; j < this.num_guests; j++)
            {
                if(this.nights_staying_list[j].includes(i)) // Translate this check
                {
                    num_guests_tonight++;
                }
            }

            let per_person_cost_tonight = this.per_night_total_cost / num_guests_tonight;

            this.num_guests_each_night_orig.push(num_guests_tonight);
            this.per_person_cost_each_night_orig.push(per_person_cost_tonight);
        }

        // Calculate per guest cost breakdown
        for(let j = 0; j < this.num_guests; j++)
        {
            let this_guest_cost = 0;

            for(let i = 0; i < this.num_nights; i++)
            {
                if (this.nights_staying_list[j].includes(i)) // Translate this check
                {
                    this_guest_cost += this.per_person_cost_each_night_orig[i];
                }
            }

            this.person_shareprice_list_orig.push(this_guest_cost)
        }

        // Check if sums to total price
        if(Math.abs(this.person_shareprice_list_orig.reduce((partialSum,a) => partialSum+a, 0) - this.total_price) > 1e3 )
        {
            // raise Warning('Per person pricing does not sum to total price. Check if there is a night nobody is staying...');
        }  

        this.original_costs_calculated = true;

        return this.person_shareprice_list_orig;
    }

    ChangeTotalPrice(new_total_price)
    {
        this.total_price = new_total_price;
        this.per_night_total_cost = this.total_price / this.num_nights;
    }

    ChangeTotalNights(total_nights)
    {
        this.num_nights = total_nights;
    }

    ChangePersonNights(name, nights_staying)
    {
        let index = this.name_list.indexOf(name); // Get index of person with input name   
        this.nights_staying_list[index] = nights_staying; // Change the list of the nights they're staying
    }

    RemovePerson(name)
    {
        index = this.name_list.indexOf(name); // Get index of person with input name
        this.nights_staying_list.splice(index,1);
        this.name_list.splice(index,1);
        this.num_guests--
    }

    CalculateRedistribution()
    {
        if(!this.original_costs_calculated)
        {
            // raise AssertionError("Cannot redistribute until original cost breakdown calculated")
        }

        this.per_person_cost_each_night_new = []
        this.num_guests_each_night_new = []
        this.person_shareprice_list_new = []
        this.amount_to_send = []
        
        // Calculate per-night cost breakdown
        for(let i = 0; i < this.num_nights; i++)
        {
            let num_guests_tonight = 0;
            
            for(let j = 0; j < this.num_guests; j++)
            {
                if(this.nights_staying_list[j].includes(i)) // Translate this check
                {
                    num_guests_tonight++;
                }
            }

            let per_person_cost_tonight = this.per_night_total_cost / num_guests_tonight;

            this.num_guests_each_night_new.push(num_guests_tonight);
            this.per_person_cost_each_night_new.push(per_person_cost_tonight);
            
        }

        // Calculate per guest cost breakdown
        for(let j = 0; j < this.num_guests; j++)
        {
            let this_guest_cost = 0;

            for(let i = 0; i < this.num_nights; i++)
            {
                if (this.nights_staying_list[j].includes(i)) // Translate this check
                {
                    this_guest_cost += this.per_person_cost_each_night_new[i];
                }
            }

            this.person_shareprice_list_new.push(this_guest_cost)
        }

        // Check if sums to total price
        if(Math.abs(this.person_shareprice_list_new.reduce((partialSum,a) => partialSum+a, 0) - this.total_price) > 1e3 )
        {
            // raise Warning('Per person pricing does not sum to total price. Check if there is a night nobody is staying...');
        }  

        this.original_costs_calculated = true;

        for(let j = 0; j < this.num_guests; j++)
        {
            this.amount_to_send.push(this.person_shareprice_list_new[j]- this.person_shareprice_list_orig[j]);
        }
    }
}

// Instance of Stay object
const stay = new Stay(2717, 7);


// Provide info on people staying
stay.AddPerson("Kevin",  [0,1,2,3,4,5,6])
stay.AddPerson("Mary",   [0,1,2,3,4,5,6])
stay.AddPerson("Matthew", [0,1,2,3,4,5,6])
stay.AddPerson("Amanda", [0,1,2,3,4,5,6])
stay.AddPerson("Emily",  [0,1,2,3,4,5,6])
stay.AddPerson("Omkar",  [4,5,6])
stay.AddPerson("Ansley", [6])

// Calculate original split-up
stay.CalculateOriginalCosts()


// Make post-trip corrections
stay.ChangePersonNights("Ansley", [4,5,6])


// Calculate Redistribution
stay.CalculateRedistribution()