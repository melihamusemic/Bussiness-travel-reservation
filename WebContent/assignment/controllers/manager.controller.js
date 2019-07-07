sap.ui.controller("assignment.controllers.manager", {
	onInit : function() {
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleName : "assignment.i18n.i18n"
		});

		this.getView().setModel(i18nModel, "i18n");

		var that = this;

		var oRefToTravelData = firebase.database().ref("/reservations");
		oRefToTravelData.on("value", function(oSnapshot) {
			var mTravelData = oSnapshot.toJSON();
			var aTravelData = $.map(mTravelData, function(oElement, sGuid) {
				oElement.guid = sGuid;
				return oElement;
			});

			var requestedTravels = [];
			aTravelData.forEach(function(travel) {
				if (travel.status === "waiting for response")
					requestedTravels.push(travel);
			})
			var oTravelModel = new sap.ui.model.json.JSONModel({});
			oTravelModel.setProperty("/travels", requestedTravels);

			that.getView().setModel(oTravelModel);
		});
	},

	onAllow : function(oEvent) {
		var travel = oEvent.getSource().getBindingContext();
		var guid = travel.getProperty("guid");
		var employeeName = travel.getProperty("employee").name;
		var destination = travel.getProperty("destination");
		var start = travel.getProperty("start");
		var email = travel.getProperty("employee").email;

		firebase.database().ref("/reservations/" + guid).update({
			status : "allowed"
		})
    
		sap.m.MessageToast.show("Bussiness travel allowed");

		var managerData = sap.ui.getCore().byId("idmanager1").getModel(
				"employeeModel").getProperty("/managerData");

		var adminData = sap.ui.getCore().byId("idmanager1").getModel(
				"employeeModel").getProperty("/adminData");

		var sendEmail = firebase.functions().httpsCallable('sendEmail');
		var text = "Dear " + employeeName
				+ ", Your request for bussiness travel to " + destination
				+ " starting on " + start + " is allowed." + " Kind regards!";

		sendEmail({
			text : text,
			sendTo : email,
			sendFrom : managerData.email,
			password : managerData.password
		});

		text = "Dear admin, request for bussiness travel to " + destination
				+ " starting on " + start + " from " + employeeName
				+ " is allowed. Kind regards!";

		sendEmail({
			text : text,
			sendTo : adminData.email,
			sendFrom : managerData.email,
			password : managerData.password
		});

	},

	onReject : function(oEvent) {
		var travel = oEvent.getSource().getBindingContext();
		var guid = travel.getProperty("guid");
		var employeeName = travel.getProperty("employee").name;
		var destination = travel.getProperty("destination");
		var start = travel.getProperty("start");
		var email = travel.getProperty("employee").email;

		firebase.database().ref("/reservations/" + guid).update({
			status : "rejected"
		})

		sap.m.MessageToast.show("Bussiness travel rejected");

		var managerData = sap.ui.getCore().byId("idmanager1").getModel(
				"employeeModel").getProperty("/managerData");
		var sendEmail = firebase.functions().httpsCallable('sendEmail');
		var text = "Dear " + employeeName
				+ ", Your request for bussiness travel to " + destination
				+ " starting on " + start + " is rejected." + " Kind regards!";

		sendEmail({
			text : text,
			sendTo : email,
			sendFrom : managerData.email,
			password : managerData.password
		});
	},

	onLogout : function() {
		var oApp = sap.ui.getCore().byId("appid");
		firebase.auth().signOut().then(function() {
			oApp.to(loginPage);
			window.location.reload(true);
		}, function(error) {
		});
	}
});