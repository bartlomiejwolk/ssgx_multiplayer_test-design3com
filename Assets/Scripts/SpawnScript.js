#pragma strict

public var playerPrefab : Transform;
var playerViewID : NetworkViewID;

// ################################ MESSAGES ##################################
function OnServerInitialized() {

	SpawnPlayer(Network.player);
}

// Called also on the Server side when disconnected 
function OnDisconnectedFromServer() {
	Debug.Log("Player disconnected");
	
	// Restart Level.
	Application.LoadLevel(Application.loadedLevel);
}

function OnPlayerConnected(player : NetworkPlayer) {
	SpawnPlayer(player);
}

function OnPlayerDisconnected(player : NetworkPlayer) {
	Debug.Log("Remove Clients Objects");
	
	Network.Destroy(playerViewID);
}

// ################################ FUNCTIONS ###############################
function SpawnPlayer(player : NetworkPlayer) {
	var instPlayer : Transform = Network.Instantiate(playerPrefab, transform.position, transform.rotation, 0);
	playerViewID = instPlayer.networkView.viewID;
}