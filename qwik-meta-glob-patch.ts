import { type Plugin } from "vite";
import * as ts from "typescript";

function transformEagerAndAwait(sourceCode: string): string {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const transformer =
    <T extends ts.Node>(context: ts.TransformationContext) =>
    (root: T) => {
      const visit = (node: ts.Node): ts.Node => {
        const isImportMetaGlob =
          ts.isVariableDeclaration(node) &&
          node.initializer &&
          ts.isCallExpression(node.initializer) &&
          ts.isPropertyAccessExpression(node.initializer.expression) &&
          ts.isMetaProperty(node.initializer.expression.expression) &&
          node.initializer.expression.name.getText() === "glob";

        if (isImportMetaGlob) {
          const newArguments = node.initializer.arguments.map((arg) => {
            if (ts.isObjectLiteralExpression(arg)) {
              let eagerPropertyFound = false;
              // Map the properties to a new array, changing `eager: false` to `eager: true`
              const newProperties = arg.properties.map((property) => {
                if (
                  ts.isPropertyAssignment(property) &&
                  property.name.getText() === "eager"
                ) {
                  eagerPropertyFound = true;
                  // If `eager` is already true, return it as is, otherwise set it to true
                  return property.initializer.kind === ts.SyntaxKind.TrueKeyword
                    ? property
                    : ts.factory.updatePropertyAssignment(
                        property,
                        ts.factory.createIdentifier("eager"),
                        ts.factory.createTrue()
                      );
                }
                return property;
              });

              // If `eager` property was not found, add `eager: true`
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              if (!eagerPropertyFound) {
                newProperties.push(
                  ts.factory.createPropertyAssignment(
                    "eager",
                    ts.factory.createTrue()
                  )
                );
              }

              // Return a new object literal expression with the updated properties
              return ts.factory.updateObjectLiteralExpression(
                arg,
                newProperties
              );
            }
            return arg;
          });

          // Return a new call expression with the updated arguments
          return ts.factory.updateVariableDeclaration(
            node,
            node.name,
            node.exclamationToken,
            node.type,
            ts.factory.updateCallExpression(
              node.initializer,
              node.initializer.expression,
              node.initializer.typeArguments,
              newArguments
            )
          );
        }

        // Remove `await` from the call
        if (ts.isAwaitExpression(node)) {
          // Check if the expression within the await is a CallExpression
          if (ts.isCallExpression(node.expression)) {
            // Replace the entire AwaitExpression with the argument of the CallExpression
            return node.expression.expression;
          }
        }
        return ts.visitEachChild(node, visit, context);
      };

      return ts.visitNode(root, visit);
    };

  const result = ts.transform(sourceFile, [transformer]);
  const printer = ts.createPrinter();
  const transformedSourceFile = result.transformed[0];
  const newSourceCode = printer.printFile(
    transformedSourceFile as ts.SourceFile
  );

  return newSourceCode;
}
const myTransformPlugin = (): Plugin => {
  return {
    name: "my-transform-plugin",
    enforce: "pre",
    transform(code, id) {
      if (
        !/src\/components\/.*\.tsx$/.test(id)
        // ||
        // process.env.npm_lifecycle_event !== "build.preview"
      ) {
        return;
      }

      if (
        code.includes("import.meta.glob")
        // &&
        // process.env.npm_lifecycle_event === "build.preview"
      ) {
        const transformedCode = transformEagerAndAwait(code);
        console.log("transformedCode", transformedCode);

        return {
          code: transformedCode,
          map: null, // or generate a source map if needed
        };
      }
    },
  };
};

export default myTransformPlugin;
