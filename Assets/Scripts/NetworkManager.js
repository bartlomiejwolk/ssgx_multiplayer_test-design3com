#pragma strict

// ### Connection settings for Server ###

public var gameName:String = "Design3com";
private var serverPort:int = 25000;
// List of Game Hosts on Master Server
private var hostData:HostData[];

// ### Variables for Instatiation

var playerPrefab:GameObject;
// Empty object indicating position for Spawned Player
var spawnObject:Transform;

// ### GUI variables ###

private var btnX:int = Screen.width;
private var btnY:int = Screen.height;
private var btnW:int = Screen.width;
private var btnH:int = Screen.height; 
// Information to display on a Label at Screen bottom
private var infoLabel:String;

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
	GUI.Label(Rect(btnX*0.03, btnY*0.9, btnW*0.1, btnH*0.1), infoLabel);
	
	// When not Client and not Server
	if(!Network.isClient && !Network.isServer){
	
		// BUTTON: "Initialize Server"
		if(GUI.Button(Rect(btnX*0.03, btnY*0.07, btnW*0.2, btnH*0.06), "Initialize Server")){
			Network.InitializeServer(4, serverPort, !Network.HavePublicAddress());
			MasterServer.RegisterHost(gameName, "Networking tutorial");
			infoLabel = "Server initialized!";
		}
			
		// BUTTON: "Refresh Host List"
		if(GUI.Button(Rect(btnX*0.03, btnY*0.08+btnH*0.06, btnW*0.2, btnH*0.06), "Refresh Host List")){
			// Request Host List from Master Server
			MasterServer.RequestHostList(gameName);
			// Update Information Label
			infoLabel = "Searching...";
		}
		
		// BUTTONS: Display available Hosts (if there are any)
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
		// Clear Information Label
		infoLabel = "";
		// BUTTON: "Disconnect"
		if (GUI.Button(Rect(btnX*0.03, btnY*0.07, btnW*0.2, btnH*0.06), "Disconnect")){
			Network.Disconnect(200);
			Debug.Log("Disconnected");
		}
	}
}

//######################################## MESSAGES ########################################

function OnServerInitialized(){
	// Spanw Player on Server side
	spawnPlayer();
	}

function OnConnectedToServer(){
	// Spawn Player on Client side
	spawnPlayer();
		
	// Inform all GameObjects in the Scene on Player's side that it's time to load a Level
	/*for (var go:GameObject in FindObjectOfType(GameObject)){
		go.SendMessage("OnNetworkLoadLevel", SendMessageOptions.DontRequireReceiver);
	}*/	
}

//######################################## FUNCTION DEF. ########################################

function spawnPlayer(){
	Network.Instantiate(playerPrefab, spawnObject.position, Quaternion.identity, 0);
}