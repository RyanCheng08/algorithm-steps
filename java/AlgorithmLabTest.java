import java.util.Arrays;

/** Standalone checks. Run javac -encoding UTF-8 AlgorithmLab.java AlgorithmLabTest.java, then java AlgorithmLabTest. */
public class AlgorithmLabTest {
    private static int checks = 0;
    private static void equal(int actual, int expected, String name) {
        checks++;
        if (actual != expected) throw new AssertionError(name + ": expected " + expected + ", got " + actual);
    }
    private static void array(int[] actual, int[] expected, String name) {
        checks++;
        if (!Arrays.equals(actual, expected)) throw new AssertionError(name + ": " + Arrays.toString(actual));
    }
    private static void expectException(Runnable task, Class<? extends Throwable> expected) {
        checks++;
        try { task.run(); } catch (Throwable t) {
            if (expected.isInstance(t)) return;
            throw new AssertionError("Wrong exception", t);
        }
        throw new AssertionError("Expected " + expected.getName());
    }
    private static void checkSorts(int[] values) {
        int[] expected = values.clone(); Arrays.sort(expected);
        int[] a = values.clone(); AlgorithmLab.selectionSort(a); array(a, expected, "selection");
        a = values.clone(); AlgorithmLab.bubbleSort(a); array(a, expected, "bubble");
        a = values.clone(); AlgorithmLab.insertionSort(a); array(a, expected, "insertion");
        int[] zeros = new int[values.length]; int write = 0;
        for (int value : values) if (value != 0) zeros[write++] = value;
        a = values.clone(); AlgorithmLab.moveZeroes(a); array(a, zeros, "moveZeroes");
    }
    private static void enumerate(int[] values, int index) {
        if (index == values.length) { checkSorts(values); return; }
        for (int value = -1; value <= 1; value++) { values[index] = value; enumerate(values, index + 1); }
    }
    public static void main(String[] args) {
        equal(AlgorithmLab.totalPrice(new int[]{12,8,5}), 25, "price");
        equal(AlgorithmLab.totalPrice(new int[]{}), 0, "empty price");
        equal(AlgorithmLab.totalPrice(new int[]{7}), 7, "one price");
        equal(AlgorithmLab.valueAt(new int[]{7,2,9,4},2), 9, "index");
        equal(AlgorithmLab.valueAt(new int[]{5},0), 5, "one index");
        expectException(() -> AlgorithmLab.valueAt(new int[]{},0), IndexOutOfBoundsException.class);
        expectException(() -> AlgorithmLab.valueAt(new int[]{1},-1), IndexOutOfBoundsException.class);
        expectException(() -> AlgorithmLab.valueAt(new int[]{1},1), IndexOutOfBoundsException.class);
        equal(AlgorithmLab.sum(new int[]{2,-4,7}), 5, "sum");
        equal(AlgorithmLab.sum(new int[]{}), 0, "empty sum");
        equal(AlgorithmLab.sum(new int[]{-8}), -8, "negative sum");
        equal(AlgorithmLab.max(new int[]{-6,-2,-9,-1}), -1, "negative max");
        equal(AlgorithmLab.max(new int[]{3}), 3, "single max");
        equal(AlgorithmLab.max(new int[]{5,5,5}), 5, "duplicate max");
        expectException(() -> AlgorithmLab.max(new int[]{}), IllegalArgumentException.class);
        equal(AlgorithmLab.linearSearch(new int[]{3,1,3},3), 0, "first match");
        equal(AlgorithmLab.linearSearch(new int[]{3,1,3},8), -1, "missing");
        equal(AlgorithmLab.linearSearch(new int[]{},8), -1, "empty search");
        equal(AlgorithmLab.countVisits(new int[]{3,2,1}), 3, "visits");
        equal(AlgorithmLab.countVisits(new int[]{}), 0, "empty visits");
        for (int[] sorted : new int[][]{{}, {2}, {-5,-1,0,0,3,8}, {1,1,1}}) {
            for (int target = -7; target <= 10; target++) {
                int expected = 0;
                while (expected < sorted.length && sorted[expected] < target) expected++;
                equal(AlgorithmLab.lowerBound(sorted, target), expected, "lower bound");
                int found = AlgorithmLab.binarySearch(sorted, target);
                if (expected < sorted.length && sorted[expected] == target) {
                    checks++;
                    if (found < 0 || found >= sorted.length || sorted[found] != target) throw new AssertionError("binary hit");
                } else equal(found, -1, "binary missing");
            }
        }
        for (int n = 0; n <= 6; n++) enumerate(new int[n], 0);
        checkSorts(new int[]{9,8,7,6,5,4,3,2,1});
        System.out.println("PASS: " + checks + " checks across all 12 Java methods.");
    }
}
