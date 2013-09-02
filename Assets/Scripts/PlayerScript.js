#pragma strict

var speedShadow : GameObject;
var forcePower : float = 8000;
private var Charge : float;
private var Energy : float = 0.6;
public var speed : float = 100;

//
public var playerLerp : float = 0.1;

// Used for Rush()
/*
private var MoveDirection : Vector3;
private var prevTransformPosition : Vector3;

private var horizAxis : float;
private var vertAxis : float;

private var shadowOn : boolean = false;
*/

private var lastClientHInput : float = 0;
private var lastClientVInput : float = 0;

private var serverCurrentHInput : float = 0;
private var serverCurrentVInput : float = 0;

// This holds information about owner of this script. Used deciding if client can run this particulary instance of the script.
public var owner : NetworkPlayer;

// ### GUI variables ###

public var btnX:int = Screen.width;
public var btnY:int = Screen.height;
public var btnW:int = Screen.width;
public var btnH:int = Screen.height; 

// ##################################### AWAKE / UPDATE #####################################
function Awake() {
	// Disable rendering for Server
	if(Network.isServer)
		renderer.enabled = false;
		
	//
	if (Network.isClient) {
		enabled = false;
	}
}

function Update () {

	if (owner != null && Network.player == owner) {
		var HInput : float = Input.GetAxis("Horizontal");
		var VInput : float = Input.GetAxis("Vertical");
		
		if (lastClientHInput != HInput || lastClientVInput != VInput) {
			lastClientHInput = HInput;
			lastClientVInput = VInput;				
			
			networkView.RPC("sendMovementInput", RPCMode.Server, HInput, VInput);
		}
	}
	
	if (Network.isServer) {
		var moveDirection : Vector3 = new Vector3(serverCurrentHInput, 0, serverCurrentVInput);
		transform.Translate(speed * moveDirection * Time.deltaTime);
		
	}
	
	// Add respawn cabability
	if (Input.GetKeyDown("r")){
		transform.rotation = Quaternion.identity;
		transform.position = Vector3(2, 8, 9);
		rigidbody.velocity = Vector3.zero;
	}

}
/*	
	// Player movement control (only when I'm the owner of the gameObject)
	if(networkView.isMine){
		Rush();
		
		// Move Player
		rigidbody.AddForce(Vector3(horizAxis * forcePower, -1000, vertAxis * forcePower) * Time.deltaTime);
		
		
		if (Energy <= 0){
			if (transform.position != prevTransformPosition){
				MoveDirection = (transform.position - prevTransformPosition).normalized;
			}
		}
		
		Charge += Time.deltaTime;
		
		if (Input.GetKeyDown("space") && Charge >= 1){
			Energy = 0.2;
		} 
		
		prevTransformPosition = transform.position;
	}
	else { // Disable for online player
		gameObject.tag = "OnlinePlayer";
		enabled = false;
	}
}
*/
//######################################## GUI ########################################
function OnGUI(){
	// LABEL: ID of the networkView owner
	GUI.Label(Rect(Screen.width*0.55, 0, 500, 100), "ID of the Cube networkView owner: " + networkView.owner);
}

// ##################################### FUNCTION DEFS #####################################
/*
function Rush (){
	if (Energy > 0){Charge = 0;
		rigidbody.AddForce (MoveDirection * 80 * Time.deltaTime, ForceMode.Impulse);
			while (!shadowOn && Energy > 0){
				var cubeShadow : GameObject = Instantiate (speedShadow, transform.position, transform.rotation);
				Destroy (cubeShadow, 0.24);
				shadowOn = true;
					yield WaitForSeconds (0.04);
				shadowOn = false;
			}
		Energy -= Time.deltaTime;
	}
}
*/

@RPC
// Server uses this to set properly the 'owner' variable on a just connected Client
function setPlayer (player : NetworkPlayer){
	owner = player;
	if (player == Network.player) {
		enabled = true;
	}
}

@RPC
function sendMovementInput(HInput : float, VInput : float) {
	serverCurrentHInput = HInput;
	serverCurrentVInput = VInput;
}

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
	// Server side
	if (stream.isWriting) {
		var pos : Vector3 = transform.position;
		stream.Serialize(pos);
	}
	// Client side
	else {
		var posReceived : Vector3 = Vector3.zero;
		stream.Serialize(posReceived);
		
		transform.position = Vector3.Lerp(transform.position, posReceived, playerLerp);
	}
	
}