#pragma strict

// prefab that will be used for instanting Player's Object
public var playerPrefab : Transform;
// ViewID of a recently instanted Player's Object
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
	// Change Player's color
	networkView.RPC("SetColor", RPCMode.AllBuffered, playerViewID);
	
}

@RPC
function SetColor (playerViewID : NetworkViewID) {
	// Find (on all machines) NetworkView for an Object that was just instanted.
	// Save it into 'netView' (used for getting the object itself) 
	var netView : NetworkView = NetworkView.Find(playerViewID);
	// Create reference to the instanted Object (used for change color)
	var playerObj : Transform = netView.GetComponent(Transform);
	// Change color of the instanted Object
	playerObj.renderer.material.SetColor("_Color", Color.yellow);
	
	Debug.Log("viewID: " + playerViewID);
	Debug.Log("netView: " + netView);
	
	
	// Change color of the new instanted Object
	//var thisObj : NetworkView = GetComponent(NetworkView);
	//if (thisObj.viewID == PlayerViewID)
		//renderer.material.SetColor("_Color", Color.yellow);
}