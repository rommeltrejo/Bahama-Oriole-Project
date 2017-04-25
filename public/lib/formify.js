               $('form').jsonForm
                (
                    {
                        "schema":
                            {
                                "name":
                                    {
                                        "type": "string",
                                        "title": "Name",
                   
                                    },
                                "location":
                                    {
                                        "type": "string",
                                        "title": "Location",
                                        "required": true
                                    },
								
                                "date":
                                    {
                                        "type": "string",
                                        "title": "Date",
                                        "required": true
                                    },
								
                                "point_number":
                                    {
                                        "title": "Point Number",
                                        "type": "string",
                                        "required": true
                                    },
								
                                "habitat_a_g_2nd":
                                    {
                                        "type": "integer",
                                        "title": "AG/2nd",
                                        "required": true,
                                        "enum" : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                                    },
								
                                "habitat_coppice":
                                    {
                                        "type": "integer",
                                        "title": "Coppice",
                                        "required": true,
                                        "enum" : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                                    },
								
                                "habitat_developed":
                                    {
                                        "type": "integer",
                                        "title": "Developed",
                                        "required": true,
                                        "enum" : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                                    },
								
                                "habitat_mixed": {
                                    "type": "integer",
                                    "title": "Mixed",
                                    "required": true,
                                    "enum" : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                                },
								
                                "habitat_pine": {
                                    "type": "integer",
                                    "title": "Pine",
                                    "required": true,
                                    "enum" : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                                },
								
                                "habitat_wetland" :
                                    {
                                        "type": "integer",
                                        "title": "Wetland",
                                        "required": true,
                                        "enum" : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                                    },
								
                                "habitat_notes":
                                    {
                                        "type": "string",
                                        "title": "Habitat Notes",
                                        "required": true
                                    },
								
                                "num_cocos":
                                    {
                                        "type" : "string",
                                        "title": "No. of coconut trees",
                                        "enum" : ["0", "1-4", "5-10", "11-20", "21-50", "51-100+"]
                                    },
								
                                "num_pines":
                                    {
                                        "type": "string",
                                        "title": "No. of pines trees",
                                        "enum" : ["0", "1-4", "5-10", "11-20", "21-50", "51-100+"]
                                    },
								
                                "num_deadpine":
                                    {
                                        "type": "string",
                                        "title": "No. of deadpine trees",
                                        "enum" : ["0", "1-4", "5-10", "11-20", "21-50", "51-100+"]
                                    },
								
                                "num_thatch" :
                                    {
                                        "type": "string",
                                        "title": "No. of thatch",
                                        "enum" : ["0", "1-4", "5-10", "11-20", "21-50", "51-100+"]
                                    },
								
                                "pine_understory":
                                    {
                                        "type": "string",
                                        "title": "Pine Understory",
                                        "enum": ["0-1m", "1-2m", "2-5m","NA"]
                                    },
                                "understory_notes" : {
                                    "type": "string",
                                    "title": "Understory Notes",
                                    "required": false
                                    },
                                "Cloud":
                                    {
                                        "title" : "Cloud",
                                        "type" : "string",
                                        "enum" : ["Clear", "< 50% cloudy", "> 95% cloudy"]
                                    },
								
								"Wind":
								{
									"title" : "Wind",
                                    "type" : "string",
                                    "enum" : ["Calm", "1-3 km/h", "3-5 km/h", "5-7 km/h", "7-10 km/h", "10+ kmph"]
								}
                            },
                        "form":[
                            "*",
                            {
                                "type": "submit",
                                "title": "Submit Observations"
                            }
                        ],
                        onSubmit: function (errors, values){
                            if (errors)
                            {
                                $('#res').html('<p>Errors in response</p>');
                            }
                            else
                            {
                                $('#res').html('<p>Hello ' + values.name + '. Form has been accepted' + '</p>');
                                Researchform.verify_submission();
                                //return false;
                            }
                        },
					}
                );