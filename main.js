import * as THREE from 'three';
import { gsap } from 'gsap';

const BUTTERFLY_IMAGE_SETS = [
  ['boreal-xerfly', ['9.40.29', '9.40.31', '9.40.34', '9.40.35', '9.40.37', '9.40.42', '9.40.44']],
  ['desert-xerfly', ['9.38.33', '9.38.38', '9.38.40', '9.38.42', '9.38.44', '9.38.46', '9.38.49']],
  ['fulgid-xerfly', ['9.43.03', '9.43.05', '9.43.07', '9.43.09', '9.43.10', '9.43.13', '9.43.15']],
  ['gloaming-xerfly', ['9.36.42', '9.36.47', '9.36.53', '9.36.58', '9.37.01', '9.37.05', '9.37.09']],
  ['juniper-xerfly', ['9.39.54', '9.39.57', '9.39.59', '9.40.01', '9.40.03', '9.40.06', '9.40.08']],
  ['silt-xerfly', ['9.37.45', '9.37.53', '9.37.55', '9.37.58', '9.38.01', '9.38.03', '9.38.05']],
  ['sintered-xerfly', ['9.42.18', '9.42.22', '9.42.24', '9.42.27', '9.42.29', '9.42.31', '9.42.33']],
  ['verdant-xerfly', ['9.41.15', '9.41.18', '9.41.20', '9.41.23', '9.41.25', '9.41.27', '9.41.32']],
];
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
camera.position.set(0, 0, 24);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();
const agents = [];
const forward = new THREE.Vector3(0, 0, 1);
const tempDirection = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createButterfly(leftTexture, rightTexture, index) {
  const root = new THREE.Group();
  const leftHinge = new THREE.Group();
  const rightHinge = new THREE.Group();

  function addWing(hinge, side, texture) {
    // Each half is half as wide as it is tall in the square source photo.
    const geometry = new THREE.PlaneGeometry(1.65, 3.3);
    geometry.translate(side * 0.825, 0, 0);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    hinge.add(mesh);
    return mesh;
  }

  const leftWing = addWing(leftHinge, -1, leftTexture);
  const rightWing = addWing(rightHinge, 1, rightTexture);
  root.add(leftHinge, rightHinge);
  root.scale.setScalar(0.43);
  scene.add(root);

  // Each butterfly has its own out-of-phase GSAP flap cycle.
  const flap = gsap.timeline({
    repeat: -1,
    yoyo: true,
    delay: index * 0.075,
    defaults: { duration: 0.28, ease: 'sine.inOut' },
  });
  flap.to(leftHinge.rotation, { y: 0.82 }, 0);
  flap.to(rightHinge.rotation, { y: -0.82 }, 0);

  const velocity = new THREE.Vector3(randomBetween(-1, 1), randomBetween(-1, 1), randomBetween(-0.65, 0.65))
    .normalize()
    .multiplyScalar(randomBetween(0.8, 1.3));

  return {
    root,
    velocity,
    acceleration: new THREE.Vector3(),
    position: root.position,
    wings: [leftWing, rightWing],
  };
}

function cropWingTextures(image) {
  const splitX = Math.floor(image.width / 2);

  function cropTexture(x, width) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, x, 0, width, image.height, 0, 0, width, image.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  return [cropTexture(0, splitX), cropTexture(splitX, image.width - splitX)];
}

function buildButterfly(textureSets, index) {
  const selectedTextures = textureSets[Number(butterflySlider.value) - 1];
  const agent = createButterfly(...selectedTextures, index);
  agent.textureSets = textureSets;
  agent.root.visible = document.querySelector(`[data-butterfly="${index}"]`).checked;
  agent.position.set(randomBetween(-4, 4), randomBetween(-2.8, 2.8), randomBetween(-2.5, 2.5));
  agents.push(agent);
}

const textureLoader = new THREE.TextureLoader();
function loadTexture(path) {
  return new Promise((resolve, reject) => {
    textureLoader.load(path, resolve, undefined, reject);
  });
}

const butterflySlider = document.querySelector('#butterfly-image');
document.querySelectorAll('[data-butterfly]').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const agent = agents[Number(checkbox.dataset.butterfly)];
    if (agent) agent.root.visible = checkbox.checked;
  });
});

document.querySelectorAll('[data-audio]').forEach((button) => {
  const audio = document.getElementById(button.dataset.audio);
  const trackName = button.dataset.audio.endsWith('young') ? 'young' : 'old';
  const progress = document.querySelector(`[data-progress="${audio.id}"]`);
  const transcription = progress?.closest('.sound-control')?.nextElementSibling;
  const updateButton = () => { button.textContent = audio.paused ? `play ${trackName}` : `pause ${trackName}`; };
  audio.addEventListener('play', () => {
    updateButton();
    transcription?.classList.add('is-playing');
  });
  audio.addEventListener('pause', () => {
    updateButton();
    transcription?.classList.remove('is-playing');
  });
  audio.addEventListener('ended', () => {
    updateButton();
    transcription?.classList.remove('is-playing');
  });
  button.addEventListener('click', () => {
    document.querySelectorAll('audio').forEach((otherAudio) => {
      if (otherAudio !== audio) otherAudio.pause();
    });
    if (audio.paused) audio.play().catch((error) => console.error('Could not play sound', error));
    else audio.pause();
  });
});

document.querySelectorAll('[data-progress]').forEach((progress) => {
  const audio = document.getElementById(progress.dataset.progress);
  const syncProgress = () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    progress.value = String((audio.currentTime / audio.duration) * 100);
  };
  audio.addEventListener('loadedmetadata', syncProgress);
  audio.addEventListener('timeupdate', syncProgress);
  progress.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    }
  });
});

butterflySlider.addEventListener('input', () => {
  const imageIndex = Number(butterflySlider.value) - 1;
  agents.forEach((agent) => {
    agent.wings.forEach((wing, side) => {
      wing.material.map = agent.textureSets[imageIndex][side];
      wing.material.needsUpdate = true;
    });
  });
});

Promise.all(BUTTERFLY_IMAGE_SETS.map(([folder, timestamps]) => Promise.all(timestamps.map((timestamp) => {
  const paddedTimestamp = timestamp.split('.').map((part, index) => index === 0 ? part : part.padStart(2, '0')).join('.');
  const path = `./xerflies/${folder}/Screenshot 2026-10-28 at ${paddedTimestamp}\u202fPM.png`;
  return loadTexture(path);
}))))
  .then((folderTextures) => {
    folderTextures.forEach((textures, index) => {
      const textureSets = textures.map((texture) => {
        const wings = cropWingTextures(texture.image);
        texture.dispose();
        return wings;
      });
      buildButterfly(textureSets, index);
    });
  })
  .catch((error) => console.error('Could not load butterfly images from ./xerflies', error));

// Simple 3D boids: separation, alignment, cohesion, and soft screen-volume bounds.
const NEIGHBOR_RADIUS = 3.4;
const MAX_SPEED = 2.0;
const MAX_FORCE = 1.35;

function limit(vector, max) {
  if (vector.length() > max) vector.setLength(max);
  return vector;
}

function steerToward(desired, velocity) {
  if (desired.lengthSq() === 0) return desired;
  desired.setLength(MAX_SPEED).sub(velocity);
  return limit(desired, MAX_FORCE);
}

function updateFlock(delta, elapsed) {
  if (agents.length === 0) return;

  // Read all positions and velocities before changing any boid.
  const states = agents.map(({ position, velocity }) => ({ position: position.clone(), velocity: velocity.clone() }));
  const halfHeight = camera.top;
  const halfWidth = camera.right;
  const bounds = new THREE.Vector3(Math.max(halfWidth - 0.9, 1), halfHeight - 0.9, 3.4);

  agents.forEach((agent, i) => {
    const { position, velocity } = states[i];
    const separation = new THREE.Vector3();
    const alignment = new THREE.Vector3();
    const center = new THREE.Vector3();
    let neighbors = 0;
    let closeNeighbors = 0;

    states.forEach((other, j) => {
      if (i === j) return;
      const offset = position.clone().sub(other.position);
      const distance = offset.length();
      if (distance > 0 && distance < NEIGHBOR_RADIUS) {
        alignment.add(other.velocity);
        center.add(other.position);
        neighbors += 1;
        if (distance < 1.25) {
          separation.add(offset.normalize().divideScalar(distance));
          closeNeighbors += 1;
        }
      }
    });

    const acceleration = new THREE.Vector3();
    if (closeNeighbors > 0) {
      separation.divideScalar(closeNeighbors);
      acceleration.addScaledVector(steerToward(separation, velocity.clone()), 1.8);
    }
    if (neighbors > 0) {
      alignment.divideScalar(neighbors);
      center.divideScalar(neighbors).sub(position);
      acceleration.addScaledVector(steerToward(alignment, velocity.clone()), 0.8);
      acceleration.addScaledVector(steerToward(center, velocity.clone()), 0.65);
    }

    // Pull agents gently back toward the view volume when they drift near its edge.
    const margin = 1.2;
    const edgeSteer = new THREE.Vector3(
      position.x > bounds.x - margin ? -1 : position.x < -bounds.x + margin ? 1 : 0,
      position.y > bounds.y - margin ? -1 : position.y < -bounds.y + margin ? 1 : 0,
      position.z > bounds.z - margin ? -1 : position.z < -bounds.z + margin ? 1 : 0,
    );
    acceleration.addScaledVector(steerToward(edgeSteer, velocity.clone()), 1.4);

    // A small, smooth wander keeps the group moving when it has no nearby neighbors.
    acceleration.x += Math.sin(elapsed * 0.7 + i * 2.1) * 0.12;
    acceleration.y += Math.cos(elapsed * 0.6 + i * 1.7) * 0.12;
    acceleration.z += Math.sin(elapsed * 0.8 + i * 1.3) * 0.1;

    agent.acceleration.copy(limit(acceleration, MAX_FORCE * 2));
  });

  agents.forEach((agent) => {
    agent.velocity.addScaledVector(agent.acceleration, delta).clampLength(0, MAX_SPEED);
    if (agent.velocity.lengthSq() < 0.04) agent.velocity.set(0.2, 0.1, 0.1);
    agent.position.addScaledVector(agent.velocity, delta);
    tempDirection.copy(agent.velocity).normalize();
    tempQuaternion.setFromUnitVectors(forward, tempDirection);
    agent.root.quaternion.slerp(tempQuaternion, Math.min(delta * 3.5, 1));
  });
}

gsap.ticker.add(() => {
  const delta = Math.min(clock.getDelta(), 0.05);
  updateFlock(delta, clock.elapsedTime);
  renderer.render(scene, camera);
});

function resize() {
  const aspect = window.innerWidth / window.innerHeight;
  const halfHeight = 5.5;
  camera.left = -halfHeight * aspect;
  camera.right = halfHeight * aspect;
  camera.top = halfHeight;
  camera.bottom = -halfHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);
resize();
