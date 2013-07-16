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

// ### GUI variables ###

public var btnX:int = Screen.width;
public var btnY:int = Screen.height;
public var btnW:int = Screen.width;
public var btnH:int = Screen.height; 
// Information to display on a Label at Screen bottom
private var infoLabel:String = "xxx";

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
	// LABEL: Connections
	GUILayout.Label("Connections: " + Network.connections.Length.ToString());
	
	// LABEL: Connection Status
	GUILayout.Label("Connection Status: " + connectionStatus);
	
	// LABEL: Information from Server
	GUILayout.Label(infoLabel);
	
	// When not Client and not Server
	if(!Network.isClient && !Network.isServer){
	
		// BUTTON: "Initialize Server"
		if(GUI.Button(Rect(btnX*0.03, btnY*0.25, btnW*0.2, btnH*0.06), "Initialize Server")){
			Network.InitializeServer(4, serverPort, !Network.HavePublicAddress());
			MasterServer.RegisterHost(gameName, "Networking tutorial");
			infoLabel = "Server initialized!";
		}
			
		// BUTTON: "Refresh Host List"
		if(GUI.Button(Rect(btnX*0.03, btnY*0.26+btnH*0.06, btnW*0.2, btnH*0.06), "Refresh Host List")){
			// Request Host List from Master Server
			MasterServer.RequestHostList(gameName);
			// Update Information Label
			infoLabel = "Searching...";
		}
		
		// BUTTONS: One Button = one Host (if there are any)
		if(hostData){
			// Update Information Label
			infoLabel = "Hosts found!";
			// Show buttons - one for each Host
			for (var i:int=0; i<hostData.length; i++){
				if (GUI.Button(Rect(btnX*0.04+btnW*0.2, btnY*0.08+btnH*0.06, btnW*0.2, btnH*0.06), hostData[i].gameName)){
					// Connect to the Server
					Network.Connect(hostData[i]);
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
		if (GUI.Button(Rect(btnX*0.03, btnY*0.25, btnW*0.2, btnH*0.06), "Disconnect")){
			Network.Disconnect(200);
			Debug.Log("Disconnected");
			// Update Connection Status Label (no Client and no Server)
			connectionStatus = "Not connected";
		}
		
		// BUTTON: Instantiate new local Cube
		if (GUI.Button(Rect(btnX*0.03, btnY*0.26+btnH*0.06, btnW*0.2, btnH*0.06), "Instantiate new Cube")){
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