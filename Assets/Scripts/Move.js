#pragma strict

var speedShadow : GameObject;
var forcePower : float = 8000;
private var Charge : float;
private var Energy : float = 0.6;

// Used for Rush()
private var MoveDirection : Vector3;
private var prevTransformPosition : Vector3;

private var horizAxis : float;
private var vertAxis : float;

private var shadowOn : boolean = false;

// ##################################### UPDATE #####################################
function Update () {

	// Read Players input
	horizAxis = Input.GetAxis("Horizontal");
	vertAxis = Input.GetAxis("Vertical");
	
	// Add respawn cabability
	if (Input.GetKeyDown("r")){
		transform.rotation = Quaternion.identity;
		transform.position = Vector3(2, 8, 9);
		rigidbody.velocity = Vector3.zero;
	}
	
	// Player movement control (move only own Actor)
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

// ##################################### FUNCTION DEFS #####################################
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