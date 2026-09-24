// Shared by the model (which applies the pose) and the mascot rig (which aims
// it), in its own file so importing the numbers does not pull three.js out of
// the model's lazy chunk.

/** Baseline yaw so the (fairly flat) model reads as 3D even at rest. */
export const BASE_ROTATION_Y = 0.4
export const BASE_ROTATION_X = 0.15

/**
 * Yaw at full deflection, in radians, measured from facing the camera.
 *
 * 0.65 is where the left dock already sat under the old lopsided formula
 * (0.4 + 0.5 x 0.5), which is the side that looked right. Keeping that exact
 * angle means the left is unchanged and only the right moves to meet it.
 */
export const MAX_YAW = 0.65

/**
 * The horizontal gaze input that puts yaw at exactly zero, i.e. facing the
 * viewer. It is not 0: the model's yaw is
 * `BASE_ROTATION_Y * (1 - |x|) + x * MAX_YAW`, so x = 0 leaves the resting
 * turn in place. Solving for zero on the negative side gives this.
 */
export const FACING_FORWARD_X = -BASE_ROTATION_Y / (BASE_ROTATION_Y + MAX_YAW)
