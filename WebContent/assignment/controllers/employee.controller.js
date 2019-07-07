sap.ui.controller("assignment.controllers.employee", {
	onInit : function() {
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleName : "assignment.i18n.i18n"
		});

		this.getView().setModel(i18nModel, "i18n");
	},

	onOpenDialog : function() {
		var that = this;
		var oRefToTravelData = firebase.database().ref("/reservations");
		oRefToTravelData.on("value", function(oSnapshot) {
			var mTravelData = oSnapshot.toJSON();
			var aTravelData = $.map(mTravelData, function(oElement, sGuid) {
				oElement.guid = sGuid;
				return oElement;
			});

			var curEmployeeTravel = [];
			var curEmployee = that._getCurrentEmployee();
			var curEmployeeName = curEmployee.firstName + " "
					+ curEmployee.lastName;
			aTravelData.forEach(function(travel) {
				if (travel.employee.name === curEmployeeName)
					curEmployeeTravel.push(travel);
			})

			var oTravelModel = new sap.ui.model.json.JSONModel({});
			oTravelModel.setProperty("/travels", curEmployeeTravel);

			that.getView().setModel(oTravelModel);
		});
		sap.ui.require([ "sap/ui/core/Fragment" ], function(Fragment) {
			var oView = that.getView();

			if (!that.byId("listDialog")) {
				Fragment.load({
					id : oView.getId(),
					name : "assignment.views.listOfReservations",
					controller : that
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});

			} else {

				that.byId("listDialog").open();
			}
		})
	},

	onCloseDialog : function() {
		this.byId("listDialog").close();
	},

	onLogout : function() {
		var oApp = sap.ui.getCore().byId("appid");
		firebase.auth().signOut().then(function() {
			oApp.to(loginPage);
			window.location.reload(true);
		}, function(error) {
		});
	},

	onSend : function() {
		var sReservationGuid = this._createGUID();
		var employee = this._getCurrentEmployee();
		var employeeName = employee.firstName + " " + employee.lastName;
		var employeeEmail = employee.email;
		var destination = sap.ui.getCore().byId(this.createId("destinationid"))
				.getValue();
		var start = sap.ui.getCore().byId(this.createId("startid")).getValue();
		var end = sap.ui.getCore().byId(this.createId("endid")).getValue();
        var status = "waiting for response";
		if (destination === "" || start === "" || end === "") {
			sap.m.MessageToast.show("Please fill in all fields!");
			return;
		}

		if((start.substr(6,4)) > (end.substr(6,4))) {
			sap.m.MessageToast.show("End date could not be before start date");
			    return;
	    }

	    else if((((start.substr(0,2)) > (end.
	        substr(0,2)))&&(frdt(start.substr(3,2)) > (end.substr(3,2))))||
	        (((start.substr(0,2)) > (end.substr(0,2)))&&
	        ((start.substr(3,2)) < (end.substr(3,2))))||
	        (((start.substr(0,2)) == (end.substr(0,2)))&&((start.substr(3,2)) > 
	        (end.substr(3,2))))) {
			sap.m.MessageToast.show("End date could not be before start date");
		    return;
	    }

		firebase.database().ref("/reservations/" + sReservationGuid).set({
			destination : destination,
			employee : {
				name : employeeName,
				email : employeeEmail,
			},
        	start : start,
			end : end,
			status : status
		})
		sap.m.MessageToast.show("Request sent");

		sap.ui.getCore().byId(this.createId("destinationid")).setValue("");
		sap.ui.getCore().byId(this.createId("startid")).setValue("");
		sap.ui.getCore().byId(this.createId("endid")).setValue("");

	},

	_getCurrentEmployee : function() {
		var toReturn = null;
		var currentEmployee = sap.ui.getCore().byId("idemployee1").getModel(
				"employeeModel").getProperty("/currentEmployee");
		var employees = sap.ui.getCore().byId("idemployee1").getModel(
				"employeeModel").getProperty("/employees");
		employees.forEach(function(employee) {
			if (employee.email == currentEmployee.email) {
				toReturn = employee;
			}
		})
		return toReturn;
	},

	_createGUID : function() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,
				function(c) {
					var r = Math.random() * 16 | 0, v = c === "x" ? r
							: (r & 0x3 | 0x8);
					return v.toString(16);
				});
	}

});
