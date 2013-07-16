#pragma strict

// ### Connection settings for Server ###

public var gameName:String = "Design3com";

private var serverPort:int = 25000;
// List of Game Hosts on Master Server
private var hostData:HostData[];
private var connectionStatus:String = "Not connected";

// ### Variables for Instatiation

var playerPrefab:GameObject;
// Empty object indicating position for Spawned Player
var spawnObject:Transform;


// Information to display on a Label at Screen bottom
private var infoLabel:String = "";

public var customButton:GUIStyle;

//######################################## AWAKE/START/UPDATE ########################################

function Start(){
	
}

function Update(){
		// Read from Master Server actual Host Data (when it's available)
		if (MasterServer.PollHostList().Length > 0){
			hostData = MasterServer.PollHostList();
			
			Debug.Log("Actual Host List: " + MasterServer.PollHostList().Length);
			// Clear Host List
			MasterServer.ClearHostList();
		}
}

//######################################## GUI ########################################

function OnGUI(){
	// LABEL: Information from Server
	GUILayout.Label(infoLabel);
	
	// LABEL: Connections
	GUILayout.Label("Connections to Server: " + Network.connections.Length.ToString());
	
	// LABEL: Connection Status
	GUILayout.Label("Connection Status: " + connectionStatus);
	
	// LABEL: ID of the networkView owner
	GUILayout.Label("ID of the Camera networkView owner: " + networkView.owner);
	
	// When not Client and not Server
	if(!Network.isClient && !Network.isServer){
	
		// BUTTON: "Initialize Server"
		if(GUILayout.Button("Initialize Server")){
			Network.InitializeServer(4, serverPort, !Network.HavePublicAddress());
			MasterServer.RegisterHost(gameName, "Networking tutorial");
			infoLabel = "Server initialized!";
		}
			
		// BUTTON: "Refresh Host List"
		if(GUILayout.Button("Refresh Host List")){
			// Request Host List from Master Server
			MasterServer.RequestHostList(gameName);
			// Update Information Label
			infoLabel = "Searching...";
		}
		
		// If there is a Server...
		if(hostData){
			// Update Information Label
			infoLabel = "Hosts found!";
			// Show buttons - one for each Host
			for (var i:int=0; i<hostData.length; i++){
				// BUTTON: [Game Name]
				if (GUILayout.Button(hostData[i].gameName, customButton)){
					// Connect to the Server
					Network.Connect(hostData[i]);
					// Update Information Label
					infoLabel = "Connected!";
					// Clear Host Data polled from Server so that after disconnect, Hosts buttons won't show again.
					hostData = null;
				}
			}
		}
		
		// Inform all GameObjects in the Scene on Server's side that it's time to load a Level
		/*for (var go:GameObject in FindObjectOfType(GameObject)){
			go.SendMessage("OnNetworkLoadLevel", SendMessageOptions.DontRequireReceiver);
		}*/	
	}
	// When connected (as Server or as Player)
	else{
		// BUTTON: "Disconnect"
		if (GUILayout.Button("Disconnect")){
			Network.Disconnect(200);
			Debug.Log("Disconnected");
			// Update Connection Status Label (no Client and no Server)
			connectionStatus = "Not connected";
			
			infoLabel = "Disconnected!";
		}
		
		// BUTTON: Instantiate new local Cube
		if (GUILayout.Button("Instantiate new Cube")){
			Network.Instantiate(playerPrefab, spawnObject.position, Quaternion.identity, 0);
		}
	}
}
		
//######################################## MESSAGES ########################################
function OnConnectedToServer(){
	// Spawn Player on Client side
	spawnPlayer();
	// Set Connection Status Label to "Client"
	connectionStatus = "Client";
		
	// Inform all GameObjects in the Scene on Player's side that it's time to load a Level
	/*for (var go:GameObject in FindObjectOfType(GameObject)){
		go.SendMessage("OnNetworkLoadLevel", SendMessageOptions.DontRequireReceiver);
	}*/	
}

function OnServerInitialized(){
	// Spanw Player on Server side
	spawnPlayer();
	// Set Connection Status Label to "Server"
	connectionStatus = "Server";
}
	
function OnFailedToConnectToMasterServer(){

}

function OnPlayerDisconnected(player:NetworkPlayer){
	// Destroy Player's Object on Disconnect (should be done only by Server)
	if (Network.isServer){
		infoLabel = "Player " + player + " removed!";
		Network.RemoveRPCs(player);
		Network.DestroyPlayerObjects(player);
	}
}

/*function OnNetworkInstantiate(){

}*/

//######################################## FUNCTION DEF. ########################################

function spawnPlayer(){
	// Create new instante of a Player Actor on all Clients
	Network.Instantiate(playerPrefab, spawnObject.position, Quaternion.identity, 0);
	}

// Instantiate new local Cube
@RPC
function newCube(){
	Instantiate(playerPrefab, spawnObject.position, Quaternion.identity);
}