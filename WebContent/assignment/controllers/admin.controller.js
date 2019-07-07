sap.ui.controller("assignment.controllers.admin", {
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
				if (travel.status === "allowed")
					requestedTravels.push(travel);
			})
			var oTravelModel = new sap.ui.model.json.JSONModel({});
			oTravelModel.setProperty("/travels", requestedTravels);

			that.getView().setModel(oTravelModel);
		});
	},

	onSave : function(oEvent) {
		var list = oEvent.getSource().getParent();
		var items = list.getItems();
		var titleBox = items[0].getItems();
		var destination = titleBox[2].getText();
		var startBox = items[2].getItems();
		var start = startBox[1].getText();
		var hotelBox = items[6].getItems();
		var name = hotelBox[1].getValue();
		var address = hotelBox[3].getValue();
		var transportBox = items[7].getItems();
		var transport = transportBox[1].getValue();
		var paidBox = items[8].getItems();
		var paid = paidBox[1].getSelected();
		var documentationBox = items[9].getItems();
		var documentation = documentationBox[1].getSelected();
		var insuranceBox = items[10].getItems();
		var insurance = insuranceBox[1].getSelected();

		if (name === "" || address === "" || transport === "") {
			sap.m.MessageToast.show("Please fill in all fields!");
			return;
		}

		var travel = oEvent.getSource().getBindingContext();
		var guid = travel.getProperty("guid");

		firebase.database().ref("/reservations/" + guid).update({
			hotel : {
				name : name,
				address : address
			},
			transport : transport,
			paid : paid,
			documentation : documentation,
			insurance : insurance,
			status : "reserved"
		});

		sap.m.MessageToast.show("Bussiness travel reserved");

		var adminData = sap.ui.getCore().byId("idadmin1").getModel(
				"employeeModel").getProperty("/adminData");

		var sendEmail = firebase.functions().httpsCallable('sendEmail');
		var text = "Dear " + travel.getProperty("employee").name
				+ ", Your bussiness travel to " + destination
				+ " starting on " + start
				+ " is reserved. Informations about reservation: Hotel is "
				+ name + ", " + address + ". Your transport is " + transport;
		if (paid)
			text += " All is paid.";
		else
			text += " Nothing is paid.";
		text += " Kind regards!";

		sendEmail({
			text : text,
			sendTo : travel.getProperty("employee").email,
			sendFrom : adminData.email,
			password : adminData.password
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