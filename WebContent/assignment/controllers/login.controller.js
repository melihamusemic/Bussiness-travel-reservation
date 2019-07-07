sap.ui
		.controller(
				"assignment.controllers.login",
				{
					onInit : function() {	
						var firebaseConfig = {
							apiKey : "AIzaSyDa0WmOdzk4BJu_L62MTsqkctimmcUajT8",
							authDomain : "assignment-627a8.firebaseapp.com",
							databaseURL : "https://assignment-627a8.firebaseio.com",
							projectId : "assignment-627a8",
							storageBucket : "assignment-627a8.appspot.com",
							messagingSenderId : "770960904612",
							appId : "1:770960904612:web:77825a20fabf71c2"
						};
						
						firebase.initializeApp(firebaseConfig);
						functions = firebase.functions();
						
						var i18nModel = new sap.ui.model.resource.ResourceModel({
				            bundleName: "assignment.i18n.i18n"
				         });
						
				         this.getView().setModel(i18nModel, "i18n");       
					},
						
					   onSignin: function() {
				            var sEmail = this.getView().byId("email").getValue();
				            var sPassword = this.getView().byId("password").getValue();
				            var that = this;
				            
				            if(this._emailValidation(sEmail) == false){
				                sap.m.MessageToast.show("E-mail address is not valid!");
				            	return;
				            }
				            
				            firebase.auth().onAuthStateChanged(function(employee) {
				                if (employee) 				                   
				                    that._getEmployees(sEmail);
						            });
				            firebase.auth().signInWithEmailAndPassword(sEmail, sPassword).catch(function() {
				               sap.m.MessageToast.show("Incorrect e-mail or password");
				            });
				           },
					
				        _getEmployees: function(sEmail) {
				            var that = this;
				            var oRefToEmployeeData = firebase.database().ref("/employees");
				            oRefToEmployeeData.on("value", function(oSnapshot) {
				                var mEmployeeData = oSnapshot.toJSON();
				                var aEmployeeData = $.map(mEmployeeData, function(oElement, sGuid) {
				                    oElement.guid = sGuid;
				                    return oElement;
				                });
				            
				                var oEmployeeModel = new sap.ui.model.json.JSONModel({});
				                oEmployeeModel.setProperty("/employees", aEmployeeData);
				                oEmployeeModel.setProperty("/currentEmployee", firebase.auth().currentUser);
				               
				                aEmployeeData.forEach(function(oEmployee) {
					             if(oEmployee.role === "administrator"){
					            		var adminData = {
												email: oEmployee.email,
										};
     				            
					            	 oEmployeeModel.setProperty("/adminData", adminData);        
					             }
				                	if (oEmployee.email === sEmail){ 
					                	 var oApp = sap.ui.getCore().byId("appid");    
					                	 if(oEmployee.role === "employee")	{				                			
					                		 sap.ui.getCore().byId("idemployee1").byId("employeeTitle").setText(
					            						 oEmployee.firstName + " "
					            							+ oEmployee.lastName);
									        	
					                		 oApp.to(employeePage);
					                	 }
	         				             else if(oEmployee.role === "administrator"){
	         				            	var adminData = {
													email: oEmployee.email,
													password: oEmployee.password
											};
	         				            	
	   					            	 oEmployeeModel.setProperty("/adminData", adminData);				
	   					            	 oApp.to(adminPage);
	         				             }
	         				             else if(oEmployee.role === "manager") {
  				                  				var managerData = {
  														email: oEmployee.email,
  														password: oEmployee.password
  												};

  				                  				oEmployeeModel.setProperty("/managerData", managerData);
  								               
  				                    		 oApp.to(managerPage);
					            	 }
					                }
					           });
				                
				                that.getView().setModel(oEmployeeModel, "employeeModel");
				                sap.ui.getCore().byId("idemployee1").setModel(oEmployeeModel, "employeeModel");
				                sap.ui.getCore().byId("idadmin1").setModel(oEmployeeModel, "employeeModel");
				                sap.ui.getCore().byId("idmanager1").setModel(oEmployeeModel, "employeeModel");
			                 });  
				            },
				            				
						onPress : function() {
							var that = this;
							
							sap.ui.require([ "sap/ui/core/Fragment" ], function(Fragment) {
								var oView = that.getView();

								if (!that.byId("signUpDialog")) {
									Fragment.load({
										id : oView.getId(),
										name : "assignment.views.signUp",
										controller : that
									}).then(function(oDialog) {
										oView.addDependent(oDialog);
										oDialog.open();
									});

								} else {
									that.byId("signUpDialog").open();
								}
							});
							},

							onSubmit : function(){
								var firstNameText = this.byId("firstName").getValue(); 
								var lastNameText = this.byId("lastName").getValue();
								var emailText = this.byId("signUpEmail").getValue();
								var passwordText = this.byId("signUpPass").getValue();
								var passRepeatText = this.byId("repeatPass").getValue();
								
								if(firstNameText === "" || firstNameText === "" || emailText === "" || passwordText === "" || passRepeatText === "" ) {
									sap.m.MessageToast.show("Please fill in all fields!");
									return;
								}
								
								if(this._emailValidation(emailText) == false){
					                sap.m.MessageToast.show("E-mail address is not valid!");
					            	return;
					            }
								
								if(passwordText.length < 6){
									sap.m.MessageToast.show("The password must be at least 6 characters long!");
									return;
								}
								
								if(passwordText !== passRepeatText){
									sap.m.MessageToast.show("Passwords you entered are not equal! Please try again!");
									return;
								}
									
						        var sEmployeeGuid = this._createGUID();
						  		firebase.database().ref("/employees/" + sEmployeeGuid).set({
							    firstName: firstNameText,
								lastName: lastNameText,
								email: emailText,
								password: passwordText,
								role: "employee"
								})
								
								firebase.auth().createUserWithEmailAndPassword(emailText, passwordText);
						  	    sap.m.MessageToast.show("Success!");
						  	  this.byId("signUpDialog").close();
						  		
							},
							
							onCancel: function() {
								this.byId("signUpDialog").close(); 
								  },
							
					onClick : function() {
						var that = this;
						
						sap.ui.require([ "sap/ui/core/Fragment" ], function(Fragment) {
							var oView = that.getView();

							if (!that.byId("passwordForgotDialog")) {
								Fragment.load({
									id : oView.getId(),
									name : "assignment.views.passwordForgot",
									controller : that
								}).then(function(oDialog) {
									oView.addDependent(oDialog);
									oDialog.open();
								});

							} else {
								that.byId("passwordForgotDialog").open();
							}
						});

					},
					
					_createGUID: function() {
		                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
		                    var r = Math.random() * 16 | 0,
		                        v = c === "x" ? r : (r & 0x3 | 0x8);
		                    return v.toString(16);
		                });
		            },
		            
		            _emailValidation: function(email){
		            	var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
		            
		            	if (!mailregex.test(email)) 
		            		return false;
		            	return true;
		            }
				});