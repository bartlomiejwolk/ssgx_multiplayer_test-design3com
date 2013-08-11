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
	// Destroy all objects connected to a specified ViewID
	Network.Destroy(playerViewID);
}

// ################################ FUNCTIONS ###############################
function SpawnPlayer(player : NetworkPlayer) {
	// Instantiate new Player and save reference to it into 'instPlayer' (used for deriving Object's ViewID)
	var instPlayer : Transform = Network.Instantiate(playerPrefab, transform.position, transform.rotation, 0);
	// Save ViewID of a new instanted Player into 'playerViewID' (used for destroing Player's Objects)
	playerViewID = instPlayer.networkView.viewID;
}