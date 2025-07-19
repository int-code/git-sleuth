import sys
import argparse



def main():
    parser = argparse.ArgumentParser(description="git-sleuth-helper")

    parser.add_argument("--resolve-conflict", action="store_true", help="If action is to resolve conflicts")
    parser.add_argument("--apply-resolution", action="store_true", help="If action is to apply resolution")
    parser.add_argument("--merge_id", type=str, help="Merge ID of the conflict")
    parser.add_argument("--head", type=str, help="The head branch")
    parser.add_argument("--base", type=str, help="The base branch")

    # Parse args from command line
    args = parser.parse_args()

    if args.resolve_conflict:
        from conflict_handler import conflict_handler
        conflict_handler()

    elif args.apply_resolution:
        from apply_resolution import apply_resolution
        apply_resolution(args.merge_id, args.head, args.base)
    


if __name__ == "__main__":
    main()
