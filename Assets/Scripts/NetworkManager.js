#pragma strict

// ### Connection settings for Server ###

public var gameName:String = "Design3com";
private var serverPort:int = 25000;
// List of Game Hosts on Master Server
private var hostData:HostData[];
private var connectionStatus:String = "Not connected";

// ### Variables for Instatiation ###

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
	
	// LABEL: Connection Status
	GUILayout.Label("Connection Status: " + connectionStatus);
	
	// LABEL: ID of the networkView owner
	GUILayout.Label("ID of the Camera networkView owner: " + networkView.owner);
	
	// LABEL: Show "Connecting ..." when connecting
	if (Network.peerType == NetworkPeerType.Connecting)
		GUILayout.Label("Connecting...");
	
	// When not Client and not Server
	if(!Network.isClient && !Network.isServer){
	
		// BUTTON: "Initialize Server"
		if(GUILayout.Button("Initialize Server")){
			Network.InitializeServer(32, serverPort, !Network.HavePublicAddress());
			MasterServer.RegisterHost(gameName, "Networking tutorial");
			infoLabel = "Server initialized!";
		}
			
		// BUTTON: "Refresh Host List"
		if(GUILayout.Button("Refresh Host List")){
			// Remove Host Data since you'll be loading new data into it (see Update())
			hostData = null;
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
					Debug.Log("Connected to a Server!");
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
	else {
		// If Client...
		if (Network.peerType == NetworkPeerType.Client){
		// Update Information Label
		infoLabel = "Connected!";
		// LABEL: Show Ping to Server
		GUILayout.Label("Ping to Server: " + Network.GetAveragePing(Network.connections[0]) + " ms");
		}
		
		// If Server and there are connected Clients...
		if (Network.peerType == NetworkPeerType.Server){
			if (Network.connections.length >= 1){
				for (var j:int=1; j<=Network.connections.length; j++)
					GUILayout.Label("Ping to Player " + j + ": " + Network.GetAveragePing(Network.connections[j-1]));
			}
			
			// LABEL: Connections to Server
			GUILayout.Label("Connections to Server: " + Network.connections.Length.ToString());
		}
	
		// BUTTON: "Disconnect"
		if (GUILayout.Button("Disconnect")){
			Network.Disconnect(200);
			Debug.Log("Disconnected");
			// Update Connection Status Label (no Client and no Server)
			connectionStatus = "Not connected";
			
			//infoLabel = "Disconnected!";
		}
		
		// BUTTON: Instantiate new local Cube
		if (GUILayout.Button("Instantiate new Cube")){
			Network.Instantiate(playerPrefab, spawnObject.position, Quaternion.identity, 0);
		}
	}
}
		
//######################################## MESSAGES ########################################
/*function OnServerInitialized(){
	// Spanw Player on Server side
	spawnPlayer();
	// Set Connection Status Label to "Server"
	connectionStatus = "Server";
	}*/
	
/*function OnConnectedToServer(){
	// Spawn Player on Client side
	spawnPlayer();
	// Set Connection Status Label to "Client"
	connectionStatus = "Client";
		
	// Inform all GameObjects in the Scene on Player's side that it's time to load a Level
	//for (var go:GameObject in FindObjectOfType(GameObject)){
	//	go.SendMessage("OnNetworkLoadLevel", SendMessageOptions.DontRequireReceiver);
	//}	
}*/
	
/*function OnFailedToConnectToMasterServer(info:NetworkConnectionError){
	Debug.Log("NetworkConnectionError: " + info);
}

// Called on the server whenever a player is disconnected from the server.
function OnPlayerDisconnected(player:NetworkPlayer){
	// Destroy Player's Object on Disconnect (should be done only by Server)
		infoLabel = "Player " + player + " removed!";
		Network.RemoveRPCs(player);
		Network.DestroyPlayerObjects(player);
		
		Debug.Log("Player disconnected from: " + player.ipAddress + ":" + player.port);
}*/

/*// Called on client during disconnection from server, but also on the server when the connection has disconnected.
function OnDisconnectedFromServer(info:NetworkDisconnection){
	infoLabel = ("Reason: " + info);
}*/

/*// ???
function OnNetworkInstantiate(info:NetworkMessageInfo){
	Debug.Log("New Object instantiated by: " + info.sender);
}*/

/*// ???
function OnSerializeNetworkStream(stream:BitStream, info:NetworkMessageInfo){

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