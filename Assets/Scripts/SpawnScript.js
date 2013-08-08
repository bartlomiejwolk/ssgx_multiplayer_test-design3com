#pragma strict

public var playerPrefab : Transform;

// ################################ MESSAGES ##################################
function OnPlayerDisconnected() {

}

// Called also on the Server side when disconnected 
function OnDisconnectedFromServer() {
	Debug.Log("Player disconnedted");
	
	// Restart Level. Players object on the Server side will be removed.
	Application.LoadLevel(Application.loadedLevel);
}

function OnServerInitialized() {

	SpawnPlayer(Network.player);
}


// ################################ FUNCTIONS ###############################
function SpawnPlayer(player : NetworkPlayer) {
	
	var instObj : Transform = Network.Instantiate(playerPrefab, transform.position, transform.rotation, 0);
}