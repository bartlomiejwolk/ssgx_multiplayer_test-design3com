#pragma strict

var dest : Vector3 = new Vector3(34, 3.8, 32);

function Start () {

}

function Update () {

	transform.position = Vector3.Lerp(transform.position, dest, 0.001);

}