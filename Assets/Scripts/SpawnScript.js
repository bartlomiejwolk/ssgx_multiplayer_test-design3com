#pragma strict

// prefab that will be used for instanting Player's Object
public var playerPrefab : Transform;
// ViewID of a recently instanted Player's Object
var playerViewID : NetworkViewID;
// Array of available colors for connected Players
// Colors are assigned to the array from Unity's Inspector
var cubeColor : Color[];
// Each instanted Player Object will have its own ID numer (needed for assigning color for new Player)
var playerID : int = 0;
// Array that contains pointers to scripts 'PlayerScript.js' which every Player Object has
var playerScripts : ArrayList = new ArrayList();

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
	// For each Player in 'playerScripts' ...
	for(var script : PlayerScript in playerScripts) {
		// ... check if the owner of the script is the Player who just disconnected
		if (player == script.owner) {
			// Destroy Game Object to which the script belongs to
			Network.Destroy(script.gameObject);
			// Remove Player from 'playerScripts' array
			playerScripts.Remove(script);
			break;
		}
	}
}

// ################################ FUNCTIONS ###############################
function SpawnPlayer(player : NetworkPlayer) {
	// Instantiate new Player and save reference to it into 'instPlayer' (used for deriving Object's ViewID)
	var instPlayer : Transform = Network.Instantiate(playerPrefab, transform.position, transform.rotation, 0);
	// Save ViewID of a new instanted Player into 'playerViewID' (used for destroing Player's Objects)
	playerViewID = instPlayer.networkView.viewID;
	// Change Player's color
	networkView.RPC("SetColor", RPCMode.AllBuffered, playerViewID, Vector3(cubeColor[playerID].r, cubeColor[playerID].g, cubeColor[playerID].b));
	// Increase Player's Object ID that will be assigned for the next instanted Player Object.
	playerID += 1;
	// Add reference to 'PlayerScript' Script component to the 'playerScripts' array
	playerScripts.Add(instPlayer.GetComponent(PlayerScript));
	// Create reference to the NetworkView of the newly created Player
	var newObjNetworkView : NetworkView = instPlayer.networkView;
	// Set 'owner' variable in the "PlayerScript" script. Using 'newObjNetworkView' allows separate RPC call and it's definition ('PlayerScript' script).
	newObjNetworkView.RPC("setPlayer", RPCMode.AllBuffered, player);
	
	// List values of 'PlayerScript.js -> owner' variable for debuging purposes
	for (var script : PlayerScript in playerScripts) {
		Debug.Log("[variable] PlayerScript.owner: " + script.owner);
	}
	
}

@RPC
function SetColor (playerViewID : NetworkViewID, cubeColor : Vector3) {
	// Find (on all machines) NetworkView for an Object that was just instanted.
	// Save it into 'netView' (used for getting the object itself) 
	var netView : NetworkView = NetworkView.Find(playerViewID);
	// Create reference to the instanted Object (used for change color)
	var playerObj : Transform = netView.GetComponent(Transform);
	// Change color of the instanted Object
	playerObj.renderer.material.color = Color (cubeColor.x, cubeColor.y, cubeColor.z, 1);
	
	Debug.Log("viewID: " + playerViewID);
	Debug.Log("netView: " + netView);
}