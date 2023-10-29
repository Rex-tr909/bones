const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = CreateScene();

async function CreateScene() {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI, Math.PI / 2, 30, new BABYLON.Vector3(0, 5, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.1, 1, 0.3));

    BABYLON.MeshBuilder.CreateGround("Ground", { width: 5, height: 5 });
    let helperSphere = BABYLON.MeshBuilder.CreateSphere("Helper Sphere");
    helperSphere.material = new BABYLON.StandardMaterial("Red Material", scene);
    helperSphere.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

    await BABYLON.SceneLoader.AppendAsync("", "data:" + ARM_MODEL, scene);
    const rootNode = scene.getNodeByName("__root__");

    const lower = scene.getMeshByName("Lower");
    const upper = scene.getMeshByName("Upper");
    const target = scene.getMeshByName("Base");
    target.setParent(rootNode);

    helperSphere.setParent(upper);
    helperSphere.position = new BABYLON.Vector3(0, 6, 0);

    lower.rotation = BABYLON.Vector3.Zero();
    upper.rotation = BABYLON.Vector3.Zero();
    target.rotation = BABYLON.Vector3.Zero();
    target.position = new BABYLON.Vector3(0, 12, 0);

    let dragBehaviour = new BABYLON.PointerDragBehavior();
    dragBehaviour.useObjectOrientationForDragging = true;
    target.addBehavior(dragBehaviour);

    function updateLowerInput(inputValue) {
        return BABYLON.Tools.ToRadians(90 - (inputValue - 1) * -90);
    }

    function updateUpperInput(inputValue) {
        return BABYLON.Tools.ToRadians(180 - (inputValue - 1) * -180);
    }

    scene.registerBeforeRender(() => {
        lower.lookAt(target.position, 0, Math.PI / 2, 0);
        let targetDistance = BABYLON.Vector3.Distance(lower.position, target.absolutePosition);
        let maxLength = lower.getBoundingInfo().maximum.y + upper.getBoundingInfo().maximum.y;
        let rotationAmountRequired = targetDistance / maxLength;
        let rotationAmountClamped = rotationAmountRequired > 1 ? 1 : rotationAmountRequired;
        let rotationNormalised = -rotationAmountClamped + 1;
        // let calculatedRotationLower = new BABYLON.Vector3((Math.PI / 180) * 120 * rotationNormalised, 0, 0);
        // let calculatedRotationUpper = new BABYLON.Vector3((Math.PI / 180) * 240 * rotationNormalised, 0, 0);
        let calculatedRotationLower = new BABYLON.Vector3(updateLowerInput(rotationNormalised), 0, 0);
        let calculatedRotationUpper = new BABYLON.Vector3(updateUpperInput(rotationNormalised), 0, 0);
        lower.rotation.subtractInPlace(calculatedRotationLower);
        upper.rotation = calculatedRotationUpper;

        let difference = BABYLON.Vector3.Distance(helperSphere.absolutePosition, target.absolutePosition);
        console.log(rotationAmountClamped.toFixed(2), difference.toFixed(2));
    });

    scene.debugLayer.show();

    engine.runRenderLoop(() => { scene.render(); });
    window.addEventListener("resize", () => { engine.resize(); });
};