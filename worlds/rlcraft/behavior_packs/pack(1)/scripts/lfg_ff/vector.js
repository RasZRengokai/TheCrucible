/* Created by Lofi Girl. This code is like lo-fi beats: made to chill, not to steal ;) */
export class Vector {
constructor(x = 0, y = 0, z = 0) {
if (typeof x === 'object' && x !== null && 'x' in x && 'y' in x && 'z' in x) {
this.x = x.x;
this.y = x.y;
this.z = x.z;
} else {
this.x = x;
this.y = y;
this.z = z;
}
}
add(vec) {
this.x += vec.x;
this.y += vec.y;
this.z += vec.z;
return this;
}
subtract(vec) {
this.x -= vec.x;
this.y -= vec.y;
this.z -= vec.z;
return this;
}
multiply(scalarOrVec) {
if (scalarOrVec instanceof Vector) {
this.x *= scalarOrVec.x;
this.y *= scalarOrVec.y;
this.z *= scalarOrVec.z;
} else {
this.x *= scalarOrVec;
this.y *= scalarOrVec;
this.z *= scalarOrVec;
}
return this;
}
divide(scalarOrVec) {
if (scalarOrVec instanceof Vector) {
if (scalarOrVec.x !== 0 && scalarOrVec.y !== 0 && scalarOrVec.z !== 0) {
this.x /= scalarOrVec.x;
this.y /= scalarOrVec.y;
this.z /= scalarOrVec.z;
} else {
console.error('Error: Division by zero in one of the vector components');
}
} else if (scalarOrVec !== 0) {
this.x /= scalarOrVec;
this.y /= scalarOrVec;
this.z /= scalarOrVec;
} else {
console.error('Error: Division by zero');
}
return this;
}
dot(vec) {
return this.x * vec.x + this.y * vec.y + this.z * vec.z;
}
cross(vec) {
const x = this.y * vec.z - this.z * vec.y;
const y = this.z * vec.x - this.x * vec.z;
const z = this.x * vec.y - this.y * vec.x;
return new Vector(x, y, z);
}
length() {
return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}
normalize() {
const length = this.length();
if (length !== 0) {
this.divide(length);
}
return this;
}
clone() {
return new Vector(this.x, this.y, this.z);
}
equals(vec) {
return this.x === vec.x && this.y === vec.y && this.z === vec.z;
}
angleBetween(vec) {
return Math.acos(this.dot(vec) / (this.length() * vec.length())) * (180 / Math.PI);
}
projectOnto(vec) {
const scalar = this.dot(vec) / vec.dot(vec);
return new Vector(vec.x * scalar, vec.y * scalar, vec.z * scalar);
}
distanceTo(vec) {
return Math.sqrt(
(this.x - vec.x) ** 2 +
(this.y - vec.y) ** 2 +
(this.z - vec.z) ** 2
);
}
toString() {
return `Vector(${this.x}, ${this.y}, ${this.z})`;
}
static add(vec1, vec2) {
return new Vector(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
}
static subtract(vec1, vec2) {
return new Vector(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
}
static multiply(vec1, scalarOrVec) {
if (scalarOrVec instanceof Vector) {
return new Vector(vec1.x * scalarOrVec.x, vec1.y * scalarOrVec.y, vec1.z * scalarOrVec.z);
} else {
return new Vector(vec1.x * scalarOrVec, vec1.y * scalarOrVec, vec1.z * scalarOrVec);
}
}
static divide(vec1, scalarOrVec) {
if (scalarOrVec instanceof Vector) {
if (scalarOrVec.x !== 0 && scalarOrVec.y !== 0 && scalarOrVec.z !== 0) {
return new Vector(vec1.x / scalarOrVec.x, vec1.y / scalarOrVec.y, vec1.z / scalarOrVec.z);
} else {
return new Vector(vec1.x, vec1.y, vec1.z);
}
} else if (scalarOrVec !== 0) {
return new Vector(vec1.x / scalarOrVec, vec1.y / scalarOrVec, vec1.z / scalarOrVec);
} else {
return new Vector(vec1.x, vec1.y, vec1.z);
}
}
static dot(vec1, vec2) {
return vec1.x * vec2.x + vec1.y * vec2.y + vec2.z * vec2.z;
}
static cross(vec1, vec2) {
const x = vec1.y * vec2.z - vec1.z * vec2.y;
const y = vec1.z * vec2.x - vec1.x * vec2.z;
const z = vec1.x * vec2.y - vec1.y * vec2.x;
return new Vector(x, y, z);
}
static length(vec) {
return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
}
static normalize(vec) {
const length = Vector.length(vec);
if (length !== 0) {
return Vector.divide(vec, length);
}
return new Vector(vec.x, vec.y, vec.z);
}
static clone(vec) {
return new Vector(vec.x, vec.y, vec.z);
}
static equals(vec1, vec2) {
return vec1.x === vec2.x && vec1.y === vec2.y && vec1.z === vec2.z;
}
static angleBetween(vec1, vec2) {
return Math.acos(Vector.dot(vec1, vec2) / (Vector.length(vec1) * Vector.length(vec2))) * (180 / Math.PI);
}
static projectOnto(vec1, vec2) {
const scalar = Vector.dot(vec1, vec2) / Vector.dot(vec2, vec2);
return new Vector(vec2.x * scalar, vec2.y * scalar, vec2.z * scalar);
}
static distanceBetween(vec1, vec2) {
return Math.sqrt(
(vec1.x - vec2.x) ** 2 +
(vec1.y - vec2.y) ** 2 +
(vec1.z - vec2.z) ** 2
);
}
static fromArray(arr) {
if (arr.length !== 3) {
throw new Error('Array must have exactly three elements');
}
return new Vector(arr[0], arr[1], arr[2]);
}
static fromObject(obj) {
if (obj.x === undefined || obj.y === undefined || obj.z === undefined) {
throw new Error('Object must have x, y, and z properties');
}
return new Vector(obj.x, obj.y, obj.z);
}
static toObject(vec) {
return { x: vec.x, y: vec.y, z: vec.z };
}
static zero() {
return new Vector(0, 0, 0);
}
static one() {
return new Vector(1, 1, 1);
}
}