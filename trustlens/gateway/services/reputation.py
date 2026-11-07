def calculate_reputation(total_reports, correct_reports):
    if total_reports == 0:
        return 50

    accuracy = correct_reports / total_reports

    reputation = round(accuracy * 100)

    return reputation